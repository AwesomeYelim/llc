"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/about", label: "교회소개" },
  { href: "/sermons", label: "설교영상" },
  { href: "/blog", label: "블로그" },
  { href: "/praise", label: "찬양콘티" },
  { href: "/bulletin", label: "주보" },
  { href: "/columns", label: "설교칼럼" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isHome = pathname === "/"

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || !isHome
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2">
              <span
                className={cn(
                  "text-lg lg:text-xl font-bold transition-colors",
                  scrolled || !isHome ? "text-[#1e3a5f]" : "text-white"
                )}
              >
                동남생명의빛교회
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative",
                    scrolled || !isHome
                      ? "text-gray-700 hover:text-[#1e3a5f]"
                      : "text-white/90 hover:text-white",
                    pathname === link.href && "font-bold"
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#d4a017]" />
                  )}
                </Link>
              ))}
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
                    scrolled || !isHome ? "bg-gray-800" : "bg-white",
                    mobileOpen && "rotate-45"
                  )}
                />
                <span
                  className={cn(
                    "w-full h-0.5 transition-all",
                    scrolled || !isHome ? "bg-gray-800" : "bg-white",
                    mobileOpen && "opacity-0"
                  )}
                />
                <span
                  className={cn(
                    "w-full h-0.5 transition-all origin-left",
                    scrolled || !isHome ? "bg-gray-800" : "bg-white",
                    mobileOpen && "-rotate-45"
                  )}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

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
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-xl lg:hidden"
            >
              <div className="p-6 pt-20">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block py-3 text-lg font-medium border-b border-gray-100",
                      pathname === link.href
                        ? "text-[#1e3a5f] font-bold"
                        : "text-gray-700"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
