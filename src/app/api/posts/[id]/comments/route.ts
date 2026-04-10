import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(
      comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))
    )
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id: postId } = await params

  try {
    const { content } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Comentário não pode ser vazio.' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: { content: content.trim(), postId, authorId: auth.userId },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json({ ...comment, createdAt: comment.createdAt.toISOString() })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
