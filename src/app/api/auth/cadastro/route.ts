import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setSessionCookie } from '@/lib/auth'
import { isValidUsername } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { username, displayName, email, password } = await req.json()

    if (!username || !displayName || !email || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
    }

    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Username inválido. Use apenas letras, números e underscore (3–30 chars).' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 8 caracteres.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    })

    if (existing) {
      const field = existing.username === username ? 'Username' : 'E-mail'
      return NextResponse.json({ error: `${field} já está em uso.` }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username,
        displayName,
        email,
        passwordHash,
      },
    })

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
