import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen font-body">
      <Header />
      <main className="flex-grow pt-0">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
