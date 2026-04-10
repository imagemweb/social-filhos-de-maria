'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CadastroPage() {
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Erro ao criar conta.')
      return
    }

    router.push('/home')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '12px 16px',
    color: 'var(--text-primary)',
    fontSize: 17,
    outline: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <svg viewBox="0 0 24 24" style={{ width: 40, height: 40, fill: 'var(--text-primary)' }}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.905-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        <h1 style={{ fontSize: 31, fontWeight: 800, marginBottom: 32 }}>Crie sua conta</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            placeholder="Nome de exibição"
            value={form.displayName}
            onChange={(e) => set('displayName', e.target.value)}
            required
            style={inputStyle}
          />

          <div>
            <input
              type="text"
              placeholder="@username"
              value={form.username}
              onChange={(e) => set('username', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              required
              maxLength={30}
              style={inputStyle}
            />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, paddingLeft: 4 }}>
              Apenas letras, números e _ (3–30 chars)
            </p>
          </div>

          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
            style={inputStyle}
          />

          <div>
            <input
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required
              style={inputStyle}
            />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, paddingLeft: 4 }}>
              Mínimo 8 caracteres
            </p>
          </div>

          {error && <p style={{ color: '#f4212e', fontSize: 14 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg)',
              borderRadius: 9999,
              padding: '16px',
              fontSize: 17,
              fontWeight: 700,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p style={{ marginTop: 32, color: 'var(--text-secondary)', fontSize: 15 }}>
          Já tem uma conta?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
