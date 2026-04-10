'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Avatar from './Avatar'

interface SidebarLeftProps {
  user: {
    username: string
    displayName: string
    avatarUrl: string | null
  } | null
  onPostClick?: () => void
}

const navItems = [
  {
    href: '/home',
    label: 'Início',
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 26, height: 26, fill: 'currentColor' }}>
        <path d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.173-.409.456-.409.757v13.183c0 .502.418.913.929.913H9.14c.51 0 .929-.41.929-.913v-7.075h3.217v7.075c0 .502.418.913.929.913h6.171c.511 0 .929-.41.929-.913V7.903c0-.301-.158-.584-.408-.757z" />
      </svg>
    ),
  },
  {
    href: '/seguir',
    label: 'Seguir',
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 26, height: 26, fill: 'currentColor' }}>
        <path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm13 2h-1.5v3H14v1.5h3.5V16H19v-3.5h3.5V11H19V8zm-9 5c-4.418 0-8 1.79-8 4v1h2v-1c0-.942 2.738-2 6-2s6 1.058 6 2v1h2v-1c0-2.21-3.582-4-8-4z" />
      </svg>
    ),
  },
  {
    href: '/perfil',
    label: 'Perfil',
    icon: (
      <svg viewBox="0 0 24 24" style={{ width: 26, height: 26, fill: 'currentColor' }}>
        <path d="M17.863 13.44c1.477 1.58 2.366 3.38 2.632 5.43H3.51c.266-2.05 1.155-3.85 2.632-5.43 1.498-1.6 3.498-2.5 5.858-2.5s4.36.9 5.863 2.5zM12 2C9.791 2 8 3.79 8 6s1.791 4 4 4 4-1.79 4-4-1.791-4-4-4z" />
      </svg>
    ),
  },
]

export default function SidebarLeft({ user, onPostClick }: SidebarLeftProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <aside
      style={{
        width: 275,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 12px',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          borderRadius: '50%',
          margin: '4px 0 4px -4px',
          transition: 'background .2s',
          color: 'var(--text-primary)',
        }}
        aria-label="Início"
      >
        <svg viewBox="0 0 24 24" style={{ width: 30, height: 30, fill: 'currentColor' }}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.905-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </Link>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
        {navItems.map((item) => {
          const isActive =
            item.href === '/perfil'
              ? pathname === '/perfil' || pathname === `/perfil/editar`
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '12px',
                borderRadius: 9999,
                fontSize: 20,
                fontWeight: isActive ? 700 : 400,
                color: 'var(--text-primary)',
                width: 'fit-content',
                transition: 'background .2s',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Post button */}
      <button
        onClick={onPostClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 16,
          padding: '16px',
          borderRadius: 9999,
          background: 'var(--accent)',
          color: '#fff',
          fontSize: 17,
          fontWeight: 700,
          width: '100%',
          maxWidth: 232,
          border: 'none',
          cursor: 'pointer',
          transition: 'background .2s',
        }}
      >
        Publicar
      </button>

      {/* User */}
      {user && (
        <div style={{ marginTop: 'auto', marginBottom: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              borderRadius: 9999,
              cursor: 'pointer',
              transition: 'background .2s',
            }}
            onClick={handleLogout}
            title="Sair"
          >
            <Avatar src={user.avatarUrl} alt={user.displayName} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.displayName}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                @{user.username}
              </p>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: 20 }}>···</span>
          </div>
        </div>
      )}
    </aside>
  )
}
