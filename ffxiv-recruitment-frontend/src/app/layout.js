import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/context/AuthContext'
import { NotificationProvider } from '@/context/NotificationContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'FFXIV Recruitment Platform',
  description: 'Find and recruit for FFXIV static groups',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}