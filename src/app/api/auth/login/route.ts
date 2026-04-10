import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setSessionCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json()

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
    }

    const token = await signToken({
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
    })

    await setSessionCookie(token)

    return NextResponse.json({ ok: true, username: user.username })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
