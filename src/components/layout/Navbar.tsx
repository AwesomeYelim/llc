"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/about", label: "교회소개" },
  { href: "/sermons", label: "설교영상" },
  { href: "/columns", label: "설교칼럼" },
  { href: "/praise", label: "찬양" },
  { href: "/bulletin", label: "주보" },
  { href: "/calendar", label: "일정" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  const isHome = pathname === "/"
  const showDark = scrolled || !isHome

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          showDark
            ? "bg-[#fbf9f6]/80 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="flex justify-between items-center px-6 lg:px-12 py-3 lg:py-4 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            {showDark && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src="/images/logo_dark.png"
                  alt="동남 생명의 빛 교회"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </motion.div>
            )}
            <span
              className={cn(
                "font-serif text-lg lg:text-xl font-bold transition-colors duration-300",
                showDark ? "text-[#022448]" : "text-white"
              )}
            >
              Light of Life Church
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-serif text-base tracking-tight transition-colors duration-300",
                  showDark
                    ? "text-[#1e3a5f] hover:text-[#795900]"
                    : "text-white/90 hover:text-white",
                  pathname === link.href &&
                    (showDark
                      ? "text-[#795900] border-b-2 border-[#795900] pb-1"
                      : "text-white border-b-2 border-white pb-1")
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search icon (desktop) */}
          <div className="hidden lg:flex items-center">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색..."
                  className={cn(
                    "w-48 px-3 py-1.5 rounded-lg text-sm border focus:outline-none transition-colors",
                    showDark
                      ? "bg-white border-[#e4e2df] text-[#022448] focus:border-[#022448]"
                      : "bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-white/50"
                  )}
                  onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className={cn(
                    "p-1 rounded",
                    showDark ? "text-[#43474e] hover:text-[#022448]" : "text-white/70 hover:text-white"
                  )}
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="검색"
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showDark ? "text-[#1e3a5f] hover:text-[#795900]" : "text-white/90 hover:text-white"
                )}
              >
                <span className="material-symbols-outlined text-xl">search</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="메뉴"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={cn(
                  "w-full h-0.5 transition-all origin-left",
                  showDark ? "bg-[#022448]" : "bg-white",
                  mobileOpen && "rotate-45"
                )}
              />
              <span
                className={cn(
                  "w-full h-0.5 transition-all",
                  showDark ? "bg-[#022448]" : "bg-white",
                  mobileOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "w-full h-0.5 transition-all origin-left",
                  showDark ? "bg-[#022448]" : "bg-white",
                  mobileOpen && "-rotate-45"
                )}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#fbf9f6] z-50 shadow-xl lg:hidden"
            >
              <div className="p-6 pt-8">
                <div className="mb-8 flex items-center gap-2.5">
                  <Image
                    src="/images/logo_dark.png"
                    alt="동남 생명의 빛 교회"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-serif text-lg font-bold text-[#022448]">
                    Light of Life Church
                  </span>
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block py-3 font-serif text-lg border-b border-[#e4e2df]",
                      pathname === link.href
                        ? "text-[#795900] font-bold"
                        : "text-[#1e3a5f] hover:text-[#795900]"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/search"
                  className="flex items-center gap-2 py-3 font-serif text-lg text-[#1e3a5f] hover:text-[#795900]"
                >
                  <span className="material-symbols-outlined text-xl">search</span>
                  검색
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
