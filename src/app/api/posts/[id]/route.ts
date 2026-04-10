import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) return NextResponse.json({ error: 'Post não encontrado.' }, { status: 404 })
    if (post.authorId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissão.' }, { status: 403 })
    }

    await prisma.post.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
