import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PageViewTracker } from "@/components/PageViewTracker"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <PageViewTracker />
      <main className="min-h-screen pt-24">{children}</main>
      <Footer />
    </>
  )
}
