import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, signToken, setSessionCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const { displayName, bio, location, website, avatarUrl, bannerUrl } = await req.json()

    if (displayName !== undefined && !displayName.trim()) {
      return NextResponse.json({ error: 'Nome não pode ser vazio.' }, { status: 400 })
    }

    if (bio !== undefined && bio.length > 160) {
      return NextResponse.json({ error: 'Bio deve ter no máximo 160 caracteres.' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        ...(displayName !== undefined && { displayName: displayName.trim() }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
      },
    })

    // Atualiza o cookie com os novos dados
    const token = await signToken({
      userId: updated.id,
      username: updated.username,
      displayName: updated.displayName,
      avatarUrl: updated.avatarUrl,
      role: updated.role,
    })
    await setSessionCookie(token)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
