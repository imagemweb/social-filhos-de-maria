import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session instanceof NextResponse ? null : session.userId

    const { searchParams } = req.nextUrl
    const cursor = searchParams.get('cursor') ?? undefined
    const feed = searchParams.get('feed') ?? 'foryou' // 'foryou' | 'following'

    let authorIds: string[] | undefined

    if (feed === 'following' && userId) {
      const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      })
      authorIds = follows.map((f) => f.followingId)
      if (authorIds.length === 0) {
        return NextResponse.json({ posts: [], nextCursor: null })
      }
    }

    const posts = await prisma.post.findMany({
      where: authorIds ? { authorId: { in: authorIds } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        _count: { select: { likes: true, comments: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
      },
    })

    const hasMore = posts.length > PAGE_SIZE
    if (hasMore) posts.pop()

    const result = posts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      likedByMe: userId ? (p.likes as { id: string }[]).length > 0 : false,
      likes: undefined,
    }))

    return NextResponse.json({
      posts: result,
      nextCursor: hasMore ? posts[posts.length - 1].id : null,
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const { content, imageUrl } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Conteúdo obrigatório.' }, { status: 400 })
    }

    if (content.length > 280) {
      return NextResponse.json({ error: 'Máximo de 280 caracteres.' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        imageUrl: imageUrl ?? null,
        authorId: auth.userId,
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
    })

    return NextResponse.json({
      ...post,
      createdAt: post.createdAt.toISOString(),
      likedByMe: false,
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
