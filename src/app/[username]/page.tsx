'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import SidebarLeft from '@/components/SidebarLeft'
import SidebarRight from '@/components/SidebarRight'
import Avatar from '@/components/Avatar'
import PostCard from '@/components/PostCard'
import type { UserPublic, PostWithAuthor } from '@/lib/types'
import type { SessionPayload } from '@/lib/auth'

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [user, setUser] = useState<UserPublic | null>(null)
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [tab, setTab] = useState<'posts' | 'replies'>('posts')
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.ok ? r.json() : null),
      fetch(`/api/users/${username}`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/users/${username}/posts`).then((r) => r.ok ? r.json() : []),
    ]).then(([sess, u, p]) => {
      setSession(sess)
      setUser(u)
      setPosts(p)
      setLoading(false)
    })
  }, [username])

  async function toggleFollow() {
    if (!user) return
    setFollowLoading(true)
    const method = user.isFollowing ? 'DELETE' : 'POST'
    const res = await fetch(`/api/users/${user.username}/follow`, { method })
    if (res.ok) {
      const data = await res.json()
      setUser((u) => u ? { ...u, isFollowing: data.isFollowing, _count: { ...u._count, followers: u._count.followers + (data.isFollowing ? 1 : -1) } } : u)
    }
    setFollowLoading(false)
  }

  const isOwnProfile = session?.username === username

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', maxWidth: 1300, margin: '0 auto' }}>
        <SidebarLeft user={null} />
        <main style={{ flex: 1, maxWidth: 600, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Carregando...
        </main>
        <SidebarRight />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', maxWidth: 1300, margin: '0 auto' }}>
        <SidebarLeft user={session} />
        <main style={{ flex: 1, maxWidth: 600, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Usuário não encontrado.
        </main>
        <SidebarRight />
      </div>
    )
  }

  const joinedDate = new Date(user.joinedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: 1300, margin: '0 auto' }}>
      <SidebarLeft user={session} />

      <main style={{ flex: 1, maxWidth: 600, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '12px 16px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
          <Link href="/home" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%' }}>
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'currentColor' }}>
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
            </svg>
          </Link>
          <div>
            <p style={{ fontSize: 20, fontWeight: 800 }}>{user.displayName}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user._count.posts} publicações</p>
          </div>
        </div>

        {/* Banner */}
        <div style={{ height: 200, background: user.bannerUrl ? `url(${user.bannerUrl}) center/cover` : 'var(--bg-secondary)', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: -60, left: 16 }}>
            <div style={{ border: '4px solid var(--bg)', borderRadius: '50%', overflow: 'hidden', width: 120, height: 120, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar src={user.avatarUrl} alt={user.displayName} size={120} />
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', gap: 8 }}>
          {isOwnProfile ? (
            <Link
              href="/perfil/editar"
              style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 9999, padding: '7px 16px', fontWeight: 700, fontSize: 14 }}
            >
              Configurar perfil
            </Link>
          ) : session ? (
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              style={{
                background: user.isFollowing ? 'transparent' : 'var(--btn-light-bg)',
                color: user.isFollowing ? 'var(--text-primary)' : 'var(--btn-light-text)',
                border: user.isFollowing ? '1px solid var(--border)' : 'none',
                borderRadius: 9999,
                padding: '7px 16px',
                fontWeight: 700,
                fontSize: 14,
                cursor: followLoading ? 'not-allowed' : 'pointer',
                opacity: followLoading ? 0.7 : 1,
              }}
            >
              {user.isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
          ) : (
            <Link href="/login" style={{ background: 'var(--btn-light-bg)', color: 'var(--btn-light-text)', borderRadius: 9999, padding: '7px 16px', fontWeight: 700, fontSize: 14 }}>
              Seguir
            </Link>
          )}
        </div>

        {/* Profile info */}
        <div style={{ padding: '0 16px 16px', marginTop: 52, borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{user.displayName}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>@{user.username}</p>

          {user.bio && <p style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 8 }}>{user.bio}</p>}

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>
            {user.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor' }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                {user.location}
              </span>
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor' }}>
                <path d="M7 11h2v2H7v-2zm0 4h2v2H7v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zM5 22h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2zm0-16h14v2H5V6zm0 4h14v10H5V10z" />
              </svg>
              Participou em {joinedDate}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
            <span style={{ cursor: 'pointer' }}>
              <strong style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user._count.following}</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>Seguindo</span>
            </span>
            <span style={{ cursor: 'pointer' }}>
              <strong style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user._count.followers}</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>Seguidores</span>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {[{ key: 'posts', label: 'Publicações' }, { key: 'replies', label: 'Respostas' }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as 'posts' | 'replies')}
              style={{
                flex: 1,
                padding: 16,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: tab === key ? 700 : 400,
                color: tab === key ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {label}
              {tab === key && (
                <span style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 56, height: 4, background: 'var(--accent)', borderRadius: 9999, display: 'block' }} />
              )}
            </button>
          ))}
        </div>

        {/* Posts */}
        {tab === 'posts' && (
          posts.length === 0 ? (
            <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Sem publicações ainda</p>
              <p>Quando {isOwnProfile ? 'você publicar' : `${user.displayName} publicar`}, as publicações aparecerão aqui.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={session?.userId} />
            ))
          )
        )}

        {tab === 'replies' && (
          <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Sem respostas ainda</p>
            <p>As respostas aparecerão aqui.</p>
          </div>
        )}
      </main>

      <SidebarRight />
    </div>
  )
}
