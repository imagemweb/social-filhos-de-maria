export interface UserPublic {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  bannerUrl: string | null
  bio: string | null
  location: string | null
  website: string | null
  joinedAt: string
  _count: {
    followers: number
    following: number
    posts: number
  }
  isFollowing?: boolean
}

export interface PostWithAuthor {
  id: string
  content: string
  imageUrl: string | null
  createdAt: string
  author: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
  }
  _count: {
    likes: number
    comments: number
  }
  likedByMe?: boolean
}

export interface CommentWithAuthor {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
  }
}
