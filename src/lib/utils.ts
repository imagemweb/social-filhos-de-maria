/** Formata tempo relativo: "agora", "2m", "3h", "5d", "12 mar" */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = (Date.now() - d.getTime()) / 1000

  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`

  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

/** Formata número: 1200 → "1,2K", 1500000 → "1,5M" */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace('.', ',')}K`
  return String(n)
}

/** Valida username: apenas letras, números e underscore, 3–30 chars */
export function isValidUsername(u: string): boolean {
  return /^[a-zA-Z0-9_]{3,30}$/.test(u)
}

/** Nome seguro para arquivo (previne path traversal) */
export function safeName(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? 'file'
  return base.replace(/[^a-zA-Z0-9._-]/g, '_')
}

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'])

export function isAllowedImage(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return ALLOWED_EXTENSIONS.has(ext)
}
