import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const session = await getSession()

  try {
    const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
        likes: session?.userId ? { where: { userId: session.userId }, select: { id: true } } : false,
      },
    })

    return NextResponse.json(
      posts.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        likedByMe: session?.userId ? (p.likes as { id: string }[]).length > 0 : false,
        likes: undefined,
      }))
    )
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
