import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Filhos de Maria',
  description: 'Rede social da congregação Filhos de Maria',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
