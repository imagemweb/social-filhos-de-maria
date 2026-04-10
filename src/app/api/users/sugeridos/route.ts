import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()

  try {
    let excludeIds: string[] = []

    if (session?.userId) {
      const following = await prisma.follow.findMany({
        where: { followerId: session.userId },
        select: { followingId: true },
      })
      excludeIds = [session.userId, ...following.map((f) => f.followingId)]
    }

    const users = await prisma.user.findMany({
      where: excludeIds.length ? { id: { notIn: excludeIds } } : undefined,
      take: 10,
      orderBy: { followers: { _count: 'desc' } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        _count: { select: { followers: true } },
      },
    })

    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
