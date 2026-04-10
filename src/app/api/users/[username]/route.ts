import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const session = await getSession()

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        location: true,
        website: true,
        joinedAt: true,
        _count: { select: { followers: true, following: true, posts: true } },
      },
    })

    if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

    let isFollowing = false
    if (session?.userId && session.userId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: session.userId, followingId: user.id } },
      })
      isFollowing = !!follow
    }

    return NextResponse.json({
      ...user,
      joinedAt: user.joinedAt.toISOString(),
      isFollowing,
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
