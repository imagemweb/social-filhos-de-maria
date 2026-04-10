'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Erro ao entrar.')
      return
    }

    router.push('/home')
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
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <svg viewBox="0 0 24 24" style={{ width: 40, height: 40, fill: 'var(--text-primary)' }}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.905-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        <h1 style={{ fontSize: 31, fontWeight: 800, marginBottom: 32 }}>Entrar no Filhos de Maria</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <input
              type="text"
              placeholder="Username ou e-mail"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '12px 16px',
                color: 'var(--text-primary)',
                fontSize: 17,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '12px 16px',
                color: 'var(--text-primary)',
                fontSize: 17,
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#f4212e', fontSize: 14 }}>{error}</p>
          )}

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
              transition: 'opacity .2s',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ marginTop: 32, color: 'var(--text-secondary)', fontSize: 15 }}>
          Não tem uma conta?{' '}
          <Link href="/cadastro" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
