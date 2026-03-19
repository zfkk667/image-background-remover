import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 })
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支持的文件格式，请上传 JPG、PNG 或 WebP 图片' }, { status: 400 })
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小超过 10MB 限制' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // 使用 sharp 处理图片：
    // 真实场景需接入 AI 模型（如 remove.bg API、rembg 等）
    // 此处演示：转为 PNG 并模拟背景移除效果（保留透明通道）
    const processed = await sharp(buffer)
      .ensureAlpha()           // 确保有 alpha 通道
      .png({ quality: 95 })   // 输出为高质量 PNG（支持透明）
      .toBuffer()

    // 获取图片尺寸信息
    const meta = await sharp(buffer).metadata()

    return new NextResponse(processed, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="removed-bg.png"`,
        'X-Image-Width': String(meta.width ?? 0),
        'X-Image-Height': String(meta.height ?? 0),
        'X-Processing-Time': String(Date.now()),
      },
    })
  } catch (err) {
    console.error('处理失败:', err)
    return NextResponse.json({ error: '图片处理失败，请重试' }, { status: 500 })
  }
}
