import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const execFileAsync = promisify(execFile)

// ── 方案 A：remove.bg API ──────────────────────────────────────────────────
async function removeViaRemoveBg(buffer: Buffer): Promise<Buffer> {
  const apiKey = process.env.REMOVE_BG_API_KEY
  if (!apiKey) throw new Error('NO_API_KEY')

  const formData = new FormData()
  formData.append('image_file', new Blob([buffer]), 'image.png')
  formData.append('size', 'auto')

  const res = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`remove.bg error ${res.status}: ${err}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

// ── 方案 B：本地 rembg（Python）────────────────────────────────────────────
async function removeViaRembg(buffer: Buffer): Promise<Buffer> {
  const dir = join(tmpdir(), `rembg-${Date.now()}`)
  await mkdir(dir, { recursive: true })

  const inputPath = join(dir, 'input.png')
  const outputPath = join(dir, 'output.png')

  try {
    // 先用 sharp 统一转为 PNG
    const png = await sharp(buffer).png().toBuffer()
    await writeFile(inputPath, png)

    // 调用 rembg CLI
    await execFileAsync('python3', [
      '-c',
      `
from rembg import remove
from PIL import Image
import io

with open(${JSON.stringify(inputPath)}, 'rb') as f:
    data = f.read()

result = remove(data)

with open(${JSON.stringify(outputPath)}, 'wb') as f:
    f.write(result)
`,
    ], { timeout: 30000 })

    return await readFile(outputPath)
  } finally {
    // 清理临时文件
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})
  }
}

// ── 主处理函数 ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 })
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的格式，请上传 JPG、PNG 或 WebP 图片' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小超过 10MB 限制' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const startTime = Date.now()

    let resultBuffer: Buffer
    let engine: string

    // 优先 remove.bg，降级到 rembg
    try {
      resultBuffer = await removeViaRemoveBg(buffer)
      engine = 'remove.bg'
    } catch (err: any) {
      if (err.message !== 'NO_API_KEY') {
        console.warn('remove.bg failed, falling back to rembg:', err.message)
      }
      resultBuffer = await removeViaRembg(buffer)
      engine = 'rembg'
    }

    const processingTime = Date.now() - startTime
    const meta = await sharp(resultBuffer).metadata()

    return new NextResponse(resultBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="removed-bg.png"`,
        'X-Engine': engine,
        'X-Processing-Time': String(processingTime),
        'X-Image-Width': String(meta.width ?? 0),
        'X-Image-Height': String(meta.height ?? 0),
      },
    })
  } catch (err: any) {
    console.error('处理失败:', err)
    return NextResponse.json({ error: '图片处理失败：' + err.message }, { status: 500 })
  }
}
