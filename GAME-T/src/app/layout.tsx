import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GameLife-T',
  description: 'GameLife Project Module',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}