import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-fallback-insecure-change-in-production-32c'
)

const PROTECTED = ['/home', '/seguir', '/perfil', '/configuracoes']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))

  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get('auth-token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/home/:path*', '/seguir/:path*', '/perfil/:path*', '/configuracoes/:path*'],
}
