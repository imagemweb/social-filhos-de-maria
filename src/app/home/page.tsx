'use client'

import { useState, useEffect, useCallback } from 'react'
import SidebarLeft from '@/components/SidebarLeft'
import SidebarRight from '@/components/SidebarRight'
import PostCard from '@/components/PostCard'
import PostModal from '@/components/PostModal'
import Avatar from '@/components/Avatar'
import type { PostWithAuthor } from '@/lib/types'
import type { SessionPayload } from '@/lib/auth'

export default function HomePage() {
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [tab, setTab] = useState<'foryou' | 'following'>('foryou')
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.ok ? r.json() : null).then(setSession)
  }, [])

  const loadPosts = useCallback(async (feed: 'foryou' | 'following', cursor?: string) => {
    setLoading(true)
    const params = new URLSearchParams({ feed })
    if (cursor) params.set('cursor', cursor)

    const res = await fetch(`/api/posts?${params}`)
    if (res.ok) {
      const data = await res.json()
      setPosts((prev) => cursor ? [...prev, ...data.posts] : data.posts)
      setNextCursor(data.nextCursor)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    setPosts([])
    loadPosts(tab)
  }, [tab, loadPosts])

  function handlePosted(post: PostWithAuthor) {
    setPosts((prev) => [post, ...prev])
  }

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: 1300, margin: '0 auto' }}>
      <SidebarLeft user={session} onPostClick={() => setModalOpen(true)} />

      <main style={{ flex: 1, maxWidth: 600, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', minHeight: '100vh' }}>
        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 10,
          }}
        >
          {[
            { key: 'foryou', label: 'Para você' },
            { key: 'following', label: 'Seguindo' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as 'foryou' | 'following')}
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
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 56,
                    height: 4,
                    background: 'var(--accent)',
                    borderRadius: 9999,
                    display: 'block',
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Inline composer */}
        {session && (
          <div
            style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'text' }}
            onClick={() => setModalOpen(true)}
          >
            <Avatar src={session.avatarUrl} alt={session.displayName} size={40} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 20, color: 'var(--text-secondary)', padding: '8px 0' }}>O que está acontecendo?</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <button
                  style={{
                    background: 'var(--accent)',
                    color: '#fff',
                    borderRadius: 9999,
                    padding: '8px 20px',
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    opacity: 0.5,
                    cursor: 'pointer',
                  }}
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        {loading && posts.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            {tab === 'following' ? 'Siga pessoas para ver as publicações delas aqui.' : 'Nenhuma publicação ainda.'}
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={session?.userId}
                onDelete={handleDelete}
              />
            ))}
            {nextCursor && (
              <div style={{ padding: 16, textAlign: 'center' }}>
                <button
                  onClick={() => loadPosts(tab, nextCursor)}
                  style={{
                    background: 'none',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent)',
                    borderRadius: 9999,
                    padding: '8px 20px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Carregar mais
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <SidebarRight />

      {session && (
        <PostModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          user={session}
          onPosted={handlePosted}
        />
      )}
    </div>
  )
}
