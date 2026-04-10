import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { safeName, isAllowedImage } from '@/lib/utils'
import path from 'path'
import fs from 'fs/promises'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 20 * 1024 * 1024 // 20MB
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Arquivo muito grande (máx 20MB).' }, { status: 400 })
    if (!isAllowedImage(file.name)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `${auth.userId}-${Date.now()}.${ext}`
    const safe = safeName(filename)
    const dest = path.resolve(UPLOAD_DIR, safe)

    // Prevenção de path traversal
    if (!dest.startsWith(path.resolve(UPLOAD_DIR))) {
      return NextResponse.json({ error: 'Caminho inválido.' }, { status: 400 })
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(dest, buffer)

    return NextResponse.json({ url: `/uploads/${safe}` })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
