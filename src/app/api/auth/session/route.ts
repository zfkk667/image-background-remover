import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value
    const secretKey = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    const { payload } = await jwtVerify(token, secretKey)

    return NextResponse.json({
      authenticated: true,
      user: payload,
    })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('session')
  return response
}