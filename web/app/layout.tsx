import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Warung Ibuk Iyos - Management System',
  description: 'Sistem management toko kelontong Warung Ibuk Iyos',
}

export default function RootLayout ({
  children,
}:{
  children: React.ReactNode
}) {
  return (
    <html lang="id"></html>
    <body className={inter.className}>
      {children}
      </body>
  )
}