import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pioneer Leads Tracker',
  description: 'Lead tracking system for Pioneer Granite and Quartz',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
