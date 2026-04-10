'use client'

import { useState } from 'react'
import Link from 'next/link'
import Avatar from './Avatar'
import { timeAgo, formatCount } from '@/lib/utils'
import type { PostWithAuthor } from '@/lib/types'

interface PostCardProps {
  post: PostWithAuthor
  currentUserId?: string
  onDelete?: (id: string) => void
}

export default function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const [liked, setLiked] = useState(post.likedByMe ?? false)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [commentCount] = useState(post._count.comments)
  const [loading, setLoading] = useState(false)

  async function toggleLike() {
    if (loading) return
    setLoading(true)

    const method = liked ? 'DELETE' : 'POST'
    const res = await fetch(`/api/posts/${post.id}/like`, { method })

    if (res.ok) {
      const data = await res.json()
      setLiked(!liked)
      setLikeCount(data.count)
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Deletar esta publicação?')) return
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
    if (res.ok) onDelete?.(post.id)
  }

  const isOwner = currentUserId === post.author.id

  return (
    <article
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background .2s',
      }}
    >
      <Link href={`/${post.author.username}`} onClick={(e) => e.stopPropagation()}>
        <Avatar src={post.author.avatarUrl} alt={post.author.displayName} size={40} />
      </Link>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
          <Link
            href={`/${post.author.username}`}
            style={{ fontWeight: 700, fontSize: 15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {post.author.displayName}
          </Link>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>@{post.author.username}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>·</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{timeAgo(post.createdAt)}</span>

          {isOwner && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete() }}
              style={{
                marginLeft: 'auto',
                color: 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                borderRadius: '50%',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Deletar"
            >
              ···
            </button>
          )}
        </div>

        {/* Content */}
        <p style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 10, wordBreak: 'break-word' }}>
          {post.content}
        </p>

        {/* Image */}
        {post.imageUrl && (
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 10, border: '1px solid var(--border)' }}>
            <img src={post.imageUrl} alt="Imagem do post" style={{ width: '100%', objectFit: 'cover', maxHeight: 400 }} />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 440 }}>
          {/* Comment */}
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 9999, padding: '6px 8px' }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
              <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
            </svg>
            {commentCount > 0 && formatCount(commentCount)}
          </button>

          {/* Repost */}
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 9999, padding: '6px 8px' }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
              <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
            </svg>
          </button>

          {/* Like */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike() }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: liked ? '#f91880' : 'var(--text-secondary)',
              fontSize: 14,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 9999,
              padding: '6px 8px',
              transition: 'color .2s',
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: liked ? '#f91880' : 'currentColor', transition: 'fill .2s' }}>
              {liked ? (
                <path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
              ) : (
                <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.6-3.011 1.404C3.439 7.976 3.028 9.026 3 10.264c-.08 5.209 7.141 11.924 9 13.451 1.86-1.527 9.081-8.242 9-13.451-.028-1.238-.44-2.288-1.292-3.36-.663-.804-1.769-1.334-3.011-1.404zm-.49 16.26c-1.86-1.527-8.07-7.33-8.19-11.78-.02-.734.187-1.402.618-1.943.368-.474.967-.8 1.79-.846.985-.05 2.116.46 2.967 1.618l1.108 1.501 1.108-1.5c.85-1.159 1.981-1.668 2.966-1.619.824.046 1.422.372 1.79.846.432.54.638 1.21.618 1.943-.12 4.45-6.33 10.25-8.19 11.78z" />
              )}
            </svg>
            {likeCount > 0 && formatCount(likeCount)}
          </button>

          {/* Save */}
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 9999, padding: '6px 8px' }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
              <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}
