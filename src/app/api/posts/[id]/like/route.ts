import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id: postId } = await params

  try {
    await prisma.like.create({ data: { postId, userId: auth.userId } })
    const count = await prisma.like.count({ where: { postId } })
    return NextResponse.json({ ok: true, count })
  } catch {
    // Unique constraint = já curtido
    const count = await prisma.like.count({ where: { postId } })
    return NextResponse.json({ ok: true, count })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id: postId } = await params

  try {
    await prisma.like.deleteMany({ where: { postId, userId: auth.userId } })
    const count = await prisma.like.count({ where: { postId } })
    return NextResponse.json({ ok: true, count })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
