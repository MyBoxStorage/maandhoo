import React from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'
import { ScrollToTop } from '@/components/layout/ScrollToTop'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CookieBanner />
    </>
  )
}
