import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const session = await getSession()
  if (session) redirect('/home')

  return (
    <div
      style={{
        background: '#fff',
        color: '#0f1419',
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      {/* LEFT — logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <svg viewBox="0 0 24 24" style={{ width: 'min(50vw, 380px)', fill: '#0f1419' }}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.905-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>

      {/* RIGHT — CTA */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 80px 40px 40px',
          gap: 40,
        }}
      >
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Acontecendo agora
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontSize: 28, fontWeight: 700 }}>Inscreva-se hoje</p>

          <Link
            href="/cadastro"
            style={{
              background: '#0f1419',
              color: '#fff',
              borderRadius: 9999,
              padding: '14px',
              fontSize: 15,
              fontWeight: 700,
              textAlign: 'center',
              maxWidth: 300,
              display: 'block',
              transition: 'background .2s',
            }}
          >
            Criar conta
          </Link>

          <p style={{ fontSize: 12, color: '#536471', maxWidth: 300 }}>
            Ao se inscrever, você concorda com os{' '}
            <a href="#" style={{ color: '#1d9bf0' }}>Termos de Serviço</a> e a{' '}
            <a href="#" style={{ color: '#1d9bf0' }}>Política de Privacidade</a>.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#536471',
              fontSize: 14,
              maxWidth: 300,
            }}
          >
            <div style={{ flex: 1, height: 1, background: '#cfd9de' }} />
            ou
            <div style={{ flex: 1, height: 1, background: '#cfd9de' }} />
          </div>

          <p style={{ color: '#536471', fontSize: 15 }}>Já tem uma conta?</p>

          <Link
            href="/login"
            style={{
              background: 'transparent',
              color: '#1d9bf0',
              border: '1px solid #cfd9de',
              borderRadius: 9999,
              padding: '14px',
              fontSize: 15,
              fontWeight: 700,
              textAlign: 'center',
              maxWidth: 300,
              display: 'block',
              transition: 'background .2s',
            }}
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}
