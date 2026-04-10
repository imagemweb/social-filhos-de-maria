'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import SidebarLeft from '@/components/SidebarLeft'
import SidebarRight from '@/components/SidebarRight'
import type { SessionPayload } from '@/lib/auth'

export default function EditarPerfilPage() {
  const router = useRouter()
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [form, setForm] = useState({ displayName: '', bio: '', location: '', website: '', avatarUrl: '', bannerUrl: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.ok ? r.json() : null).then((sess: SessionPayload | null) => {
      if (!sess) { router.push('/login'); return }
      setSession(sess)
      // Buscar dados completos do perfil
      fetch(`/api/users/${sess.username}`).then((r) => r.json()).then((user) => {
        setForm({
          displayName: user.displayName ?? '',
          bio: user.bio ?? '',
          location: user.location ?? '',
          website: user.website ?? '',
          avatarUrl: user.avatarUrl ?? '',
          bannerUrl: user.bannerUrl ?? '',
        })
      })
    })
  }, [router])

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) return null
    const data = await res.json()
    return data.url
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file)
    if (url) setForm((f) => ({ ...f, avatarUrl: url }))
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file)
    if (url) setForm((f) => ({ ...f, bannerUrl: url }))
  }

  async function handleSave() {
    setError('')
    setSaving(true)

    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erro ao salvar.')
      return
    }

    router.push(`/${session?.username}`)
  }

  if (!session) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: 1300, margin: '0 auto' }}>
      <SidebarLeft user={session} />

      <main style={{ flex: 1, maxWidth: 600, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link href={`/${session.username}`} style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%' }}>
              <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}>
                <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
              </svg>
            </Link>
            <p style={{ fontSize: 20, fontWeight: 800 }}>Editar perfil</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: 'var(--text-primary)', color: 'var(--bg)', borderRadius: 9999, padding: '6px 16px', fontWeight: 700, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        {/* Banner */}
        <div
          style={{ height: 200, background: form.bannerUrl ? `url(${form.bannerUrl}) center/cover` : 'var(--bg-secondary)', position: 'relative', cursor: 'pointer' }}
          onClick={() => bannerRef.current?.click()}
        >
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity .2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
          >
            <svg viewBox="0 0 24 24" style={{ width: 32, height: 32, fill: '#fff' }}>
              <path d="M12 15.5q1.875 0 3.188-1.313Q16.5 12.875 16.5 11q0-1.875-1.312-3.188Q13.875 6.5 12 6.5q-1.875 0-3.188 1.312Q7.5 9.125 7.5 11q0 1.875 1.312 3.187Q10.125 15.5 12 15.5zm0-2q-1.05 0-1.775-.725Q9.5 12.05 9.5 11q0-1.05.725-1.775Q10.95 8.5 12 8.5q1.05 0 1.775.725Q14.5 9.95 14.5 11q0 1.05-.725 1.775Q13.05 13.5 12 13.5zM4 21q-.825 0-1.413-.587Q2 19.825 2 19V5q0-.825.587-1.413Q3.175 3 4 3h3.15L8.7 1.5h6.6L16.85 3H20q.825 0 1.413.587Q22 4.175 22 5v14q0 .825-.587 1.413Q20.825 21 20 21z" />
            </svg>
          </div>
          <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerChange} />
        </div>

        {/* Avatar */}
        <div style={{ position: 'relative', marginTop: -60, marginLeft: 16, marginBottom: 12, width: 'fit-content' }}>
          <div
            style={{ cursor: 'pointer', position: 'relative' }}
            onClick={() => avatarRef.current?.click()}
          >
            <Avatar src={form.avatarUrl || null} alt={form.displayName} size={120} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity .2s',
              border: '4px solid var(--bg)',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
            >
              <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, fill: '#fff' }}>
                <path d="M12 15.5q1.875 0 3.188-1.313Q16.5 12.875 16.5 11q0-1.875-1.312-3.188Q13.875 6.5 12 6.5q-1.875 0-3.188 1.312Q7.5 9.125 7.5 11q0 1.875 1.312 3.187Q10.125 15.5 12 15.5zm0-2q-1.05 0-1.775-.725Q9.5 12.05 9.5 11q0-1.05.725-1.775Q10.95 8.5 12 8.5q1.05 0 1.775.725Q14.5 9.95 14.5 11q0 1.05-.725 1.775Q13.05 13.5 12 13.5zM4 21q-.825 0-1.413-.587Q2 19.825 2 19V5q0-.825.587-1.413Q3.175 3 4 3h3.15L8.7 1.5h6.6L16.85 3H20q.825 0 1.413.587Q22 4.175 22 5v14q0 .825-.587 1.413Q20.825 21 20 21z" />
              </svg>
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        </div>

        {/* Form fields */}
        <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Nome', key: 'displayName', maxLength: 50 },
            { label: 'Bio', key: 'bio', maxLength: 160 },
            { label: 'Localização', key: 'location', maxLength: 30 },
            { label: 'Site', key: 'website', maxLength: 100 },
          ].map(({ label, key, maxLength }) => (
            <div key={key} style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px' }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{label}</label>
              <input
                type="text"
                value={(form as Record<string, string>)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                maxLength={maxLength}
                style={{ width: '100%', background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 17, fontFamily: 'inherit' }}
              />
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                {(form as Record<string, string>)[key].length}/{maxLength}
              </div>
            </div>
          ))}

          {error && <p style={{ color: '#f4212e', fontSize: 14 }}>{error}</p>}
        </div>
      </main>

      <SidebarRight />
    </div>
  )
}
