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
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
    setSearchQuery("")
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
      {/* ── Main nav bar ── */}
      <nav
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          showDark
            ? "bg-[#fbf9f6]/90 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 lg:px-12 max-w-screen-2xl mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 relative">
              <Image
                src="/images/logo_dark.png"
                alt="동남 생명의 빛 교회"
                fill
                className={cn(
                  "object-contain transition-opacity duration-300",
                  showDark ? "opacity-100" : "opacity-0"
                )}
              />
            </div>
            <span
              className={cn(
                "font-serif text-lg lg:text-xl font-bold transition-colors duration-300",
                showDark ? "text-[#022448]" : "text-white"
              )}
            >
              Light of Life Church
            </span>
          </Link>

          {/* Desktop nav links — 중앙 */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative font-serif text-sm xl:text-base tracking-tight transition-colors duration-200 py-1",
                    showDark
                      ? "text-[#1e3a5f] hover:text-[#795900]"
                      : "text-white/90 hover:text-white",
                    active && (showDark ? "text-[#795900]" : "text-white")
                  )}
                >
                  {link.label}
                  {active && (
                    <span
                      className={cn(
                        "absolute inset-x-0 -bottom-px h-0.5 rounded-full",
                        showDark ? "bg-[#795900]" : "bg-white"
                      )}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* 우측: 검색 아이콘 + 모바일 햄버거 */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 검색 아이콘 — 레이아웃 고정 */}
            <button
              onClick={() => setSearchOpen((o) => !o)}
              aria-label="검색"
              className={cn(
                "hidden lg:flex w-9 h-9 items-center justify-center rounded-lg transition-colors",
                searchOpen
                  ? showDark
                    ? "bg-[#f0ede9] text-[#022448]"
                    : "bg-white/20 text-white"
                  : showDark
                  ? "text-[#1e3a5f] hover:bg-[#f0ede9] hover:text-[#022448]"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="material-symbols-outlined text-xl leading-none">
                {searchOpen ? "close" : "search"}
              </span>
            </button>

            {/* 모바일 햄버거 */}
            <button
              className={cn(
                "lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg transition-colors",
                showDark ? "text-[#022448]" : "text-white"
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="메뉴"
            >
              <span
                className={cn(
                  "w-5 h-0.5 bg-current rounded-full transition-all duration-200 origin-center",
                  mobileOpen && "translate-y-2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "w-5 h-0.5 bg-current rounded-full transition-all duration-200",
                  mobileOpen && "opacity-0 scale-x-0"
                )}
              />
              <span
                className={cn(
                  "w-5 h-0.5 bg-current rounded-full transition-all duration-200 origin-center",
                  mobileOpen && "-translate-y-2 -rotate-45"
                )}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* ── 검색 오버레이 (navbar 아래로 슬라이드) ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="fixed top-16 inset-x-0 z-40 bg-[#fbf9f6]/95 backdrop-blur-md border-b border-[#e4e2df] shadow-sm"
          >
            <form
              onSubmit={handleSearch}
              className="max-w-screen-2xl mx-auto px-6 lg:px-12 py-3 flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-[#74777f] text-xl shrink-0">search</span>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="설교, 칼럼, 찬양 검색..."
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                className="flex-1 bg-transparent text-[#022448] placeholder-[#74777f] text-base focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="shrink-0 px-3 py-1 bg-[#022448] text-white text-sm rounded-lg hover:bg-[#1e3a5f] transition-colors"
                >
                  검색
                </button>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 검색 오버레이 바깥 클릭 닫기 */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-30 top-16"
          onClick={() => setSearchOpen(false)}
        />
      )}

      {/* ── 모바일 사이드 메뉴 ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-[#fbf9f6] z-50 shadow-xl lg:hidden flex flex-col"
            >
              {/* 헤더 */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-[#e4e2df]">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logo_dark.png"
                    alt="동남 생명의 빛 교회"
                    width={28}
                    height={28}
                    className="w-7 h-7 object-contain"
                  />
                  <span className="font-serif text-base font-bold text-[#022448]">
                    동남 생명의 빛
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-[#74777f] hover:text-[#022448]"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* 링크 목록 */}
              <nav className="flex-1 overflow-y-auto py-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center px-5 py-3.5 font-serif text-base transition-colors",
                      pathname === link.href
                        ? "text-[#795900] bg-[#fdf5e6] font-semibold"
                        : "text-[#1e3a5f] hover:bg-[#f5f3f0] hover:text-[#795900]"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mx-5 my-2 border-t border-[#e4e2df]" />
                <Link
                  href="/search"
                  className="flex items-center gap-2.5 px-5 py-3.5 font-serif text-base text-[#1e3a5f] hover:bg-[#f5f3f0] hover:text-[#795900] transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">search</span>
                  통합 검색
                </Link>
                <Link
                  href="/prayer"
                  className="flex items-center gap-2.5 px-5 py-3.5 font-serif text-base text-[#1e3a5f] hover:bg-[#f5f3f0] hover:text-[#795900] transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">favorite</span>
                  기도 요청
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
