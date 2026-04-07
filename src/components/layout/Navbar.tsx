"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/about", label: "교회소개" },
  { href: "/sermons", label: "설교영상" },
  { href: "/columns", label: "설교칼럼" },
  { href: "/praise", label: "찬양콘티" },
  { href: "/bulletin", label: "주보" },
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
          <Link href="/" className="flex items-center">
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
                <div className="mb-8">
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
