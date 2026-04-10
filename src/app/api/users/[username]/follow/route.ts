import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { username } = await params

  try {
    const target = await prisma.user.findUnique({ where: { username }, select: { id: true } })
    if (!target) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    if (target.id === auth.userId) {
      return NextResponse.json({ error: 'Você não pode seguir a si mesmo.' }, { status: 400 })
    }

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: auth.userId, followingId: target.id } },
      create: { followerId: auth.userId, followingId: target.id },
      update: {},
    })

    return NextResponse.json({ ok: true, isFollowing: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { username } = await params

  try {
    const target = await prisma.user.findUnique({ where: { username }, select: { id: true } })
    if (!target) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

    await prisma.follow.deleteMany({
      where: { followerId: auth.userId, followingId: target.id },
    })

    return NextResponse.json({ ok: true, isFollowing: false })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
