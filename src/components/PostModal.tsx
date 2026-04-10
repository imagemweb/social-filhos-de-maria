'use client'

import { useState, useRef } from 'react'
import Avatar from './Avatar'
import type { PostWithAuthor } from '@/lib/types'

interface PostModalProps {
  open: boolean
  onClose: () => void
  user: { displayName: string; avatarUrl: string | null }
  onPosted: (post: PostWithAuthor) => void
}

export default function PostModal({ open, onClose, user, onPosted }: PostModalProps) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleClose() {
    setContent('')
    setImageFile(null)
    setImagePreview(null)
    setError('')
    onClose()
  }

  async function handlePost() {
    if (!content.trim()) return
    setLoading(true)
    setError('')

    try {
      let imageUrl: string | undefined

      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const up = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!up.ok) {
          setError('Erro ao fazer upload da imagem.')
          setLoading(false)
          return
        }
        const upData = await up.json()
        imageUrl = upData.url
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), imageUrl }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erro ao publicar.')
        setLoading(false)
        return
      }

      const post = await res.json()
      onPosted(post)
      handleClose()
    } catch {
      setError('Erro interno.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(91,112,131,0.4)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 40,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 600,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <button
            onClick={handleClose}
            style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Composer */}
        <div style={{ display: 'flex', gap: 12, padding: '8px 16px 12px' }}>
          <Avatar src={user.avatarUrl} alt={user.displayName} size={44} />
          <div style={{ flex: 1 }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="O que está acontecendo?"
              maxLength={280}
              rows={4}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: 20,
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
            {imagePreview && (
              <div style={{ borderRadius: 16, overflow: 'hidden', marginTop: 8, position: 'relative' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontSize: 16 }}
                >
                  ✕
                </button>
              </div>
            )}
            {error && <p style={{ color: '#f4212e', fontSize: 14, marginTop: 8 }}>{error}</p>}
          </div>
        </div>

        {/* Reply setting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 14, fontWeight: 700, padding: '0 16px 12px 72px', cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor' }}>
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
          </svg>
          Todos podem responder
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              title="Adicionar imagem"
            >
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
                <path d="M19.75 2H4.25C3.01 2 2 3.01 2 4.25v15.5C2 20.99 3.01 22 4.25 22h15.5c1.24 0 2.25-1.01 2.25-2.25V4.25C22 3.01 20.99 2 19.75 2zM4.25 3.5h15.5c.414 0 .75.336.75.75v9.676l-3.858-3.858c-.14-.14-.33-.22-.53-.22h-.003c-.2 0-.393.08-.532.224l-4.317 4.384-1.813-1.806c-.14-.14-.33-.22-.53-.22-.193-.03-.395.08-.535.227L3.5 17.642V4.25c0-.414.336-.75.75-.75zm-.75 16.5v-2.035l4.5-4.29 1.82 1.81 4.32-4.387 4.047 4.047V19.75c0 .414-.336.75-.75.75H4.25c-.414 0-.75-.336-.75-.75z" />
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {content.length > 0 && (
              <span style={{ fontSize: 14, color: content.length > 260 ? '#f4212e' : 'var(--text-secondary)' }}>
                {280 - content.length}
              </span>
            )}
            <button
              onClick={handlePost}
              disabled={!content.trim() || loading}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 9999,
                padding: '8px 20px',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: content.trim() && !loading ? 'pointer' : 'not-allowed',
                opacity: content.trim() && !loading ? 1 : 0.5,
              }}
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
