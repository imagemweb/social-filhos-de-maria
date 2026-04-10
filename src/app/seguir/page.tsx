'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SidebarLeft from '@/components/SidebarLeft'
import SidebarRight from '@/components/SidebarRight'
import Avatar from '@/components/Avatar'
import type { SessionPayload } from '@/lib/auth'

interface SuggestedUser {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  _count: { followers: number }
}

export default function SeguirPage() {
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [users, setUsers] = useState<SuggestedUser[]>([])
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.ok ? r.json() : null),
      fetch('/api/users/sugeridos').then((r) => r.json()),
    ]).then(([sess, suggested]) => {
      setSession(sess)
      setUsers(suggested)
      setLoading(false)
    })
  }, [])

  async function toggleFollow(username: string) {
    const isFollowing = following.has(username)
    const method = isFollowing ? 'DELETE' : 'POST'
    const res = await fetch(`/api/users/${username}/follow`, { method })

    if (res.ok) {
      setFollowing((prev) => {
        const next = new Set(prev)
        if (isFollowing) next.delete(username)
        else next.add(username)
        return next
      })
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: 1300, margin: '0 auto' }}>
      <SidebarLeft user={session} />

      <main style={{ flex: 1, maxWidth: 600, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', minHeight: '100vh' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 10,
          }}
        >
          <Link
            href="/home"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}>
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
            </svg>
          </Link>
          <p style={{ fontSize: 20, fontWeight: 800 }}>Seguir</p>
        </div>

        <p style={{ fontSize: 20, fontWeight: 800, padding: 16, borderBottom: '1px solid var(--border)' }}>
          Sugerido para você
        </p>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando...</div>
        ) : (
          users.map((user) => {
            const isFollowing = following.has(user.username)
            return (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background .2s',
                }}
              >
                <Link href={`/${user.username}`}>
                  <Avatar src={user.avatarUrl} alt={user.displayName} size={44} />
                </Link>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/${user.username}`}>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{user.displayName}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 4 }}>@{user.username}</p>
                    {user.bio && <p style={{ fontSize: 14, lineHeight: 1.4 }}>{user.bio}</p>}
                  </Link>
                </div>

                <button
                  onClick={() => toggleFollow(user.username)}
                  style={{
                    background: isFollowing ? 'transparent' : 'var(--btn-light-bg)',
                    color: isFollowing ? 'var(--text-primary)' : 'var(--btn-light-text)',
                    border: isFollowing ? '1px solid var(--border)' : 'none',
                    borderRadius: 9999,
                    padding: '7px 18px',
                    fontWeight: 700,
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'background .2s',
                  }}
                >
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </button>
              </div>
            )
          })
        )}
      </main>

      <SidebarRight />
    </div>
  )
}
