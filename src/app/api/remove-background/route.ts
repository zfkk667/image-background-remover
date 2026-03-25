import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Edge Runtime 兼容的背景移除 API（仅使用 remove.bg）
async function removeViaRemoveBg(buffer: ArrayBuffer, apiKey: string): Promise<ArrayBuffer> {
  const formData = new FormData()
  formData.append('image_file', new Blob([new Uint8Array(buffer)]), 'image.png')
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

  return res.arrayBuffer()
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.REMOVEBG_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: '服务未配置：缺少 API Key' }, { status: 500 })
    }

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

    const buffer = await file.arrayBuffer()
    const startTime = Date.now()

    const resultBuffer = await removeViaRemoveBg(buffer, apiKey)

    const processingTime = Date.now() - startTime

    return new NextResponse(new Uint8Array(resultBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="removed-bg.png"`,
        'X-Engine': 'remove.bg',
        'X-Processing-Time': String(processingTime),
      },
    })
  } catch (err: any) {
    console.error('处理失败:', err)
    return NextResponse.json({ error: '图片处理失败：' + err.message }, { status: 500 })
  }
}