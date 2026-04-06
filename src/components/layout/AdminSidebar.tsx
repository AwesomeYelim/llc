"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/admin/dashboard", label: "대시보드", icon: "📊" },
  { href: "/admin/sermons", label: "설교 관리", icon: "🎬" },
  { href: "/admin/praise", label: "찬양 콘티", icon: "🎵" },
  { href: "/admin/bulletins", label: "주보/PPT", icon: "📋" },
  { href: "/admin/columns", label: "설교 원고", icon: "📝" },
  { href: "/admin/gallery", label: "갤러리", icon: "🖼" },
  { href: "/admin/settings", label: "사이트 설정", icon: "⚙️" },
]

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-[#1e3a5f] text-white w-64">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin/dashboard" className="text-lg font-bold">
          관리자
        </Link>
        <p className="text-white/60 text-xs mt-1">동남생명의빛교회</p>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-6 py-3 text-sm transition-colors",
              pathname.startsWith(item.href)
                ? "bg-white/15 text-white font-medium"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="block text-center text-sm text-white/60 hover:text-white mb-2 transition-colors"
        >
          사이트 보기 →
        </Link>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full py-2 px-4 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            로그아웃
          </button>
        </form>
      </div>
    </div>
  )
}
