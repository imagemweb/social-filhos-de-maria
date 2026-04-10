import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function PerfilRedirect() {
  const session = await getSession()
  if (!session) redirect('/login')
  redirect(`/${session.username}`)
}
