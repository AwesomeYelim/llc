"use client"

import { motion } from "framer-motion"

interface QuickLinksProps {
  youtubeUrl?: string
  blogUrl?: string
}

export function QuickLinks({ youtubeUrl, blogUrl }: QuickLinksProps) {
  const links = [
    youtubeUrl && { label: "유튜브 채널", href: youtubeUrl, color: "bg-red-500 hover:bg-red-600", icon: "▶" },
    blogUrl && { label: "네이버 블로그", href: blogUrl, color: "bg-green-500 hover:bg-green-600", icon: "📝" },
  ].filter(Boolean) as { label: string; href: string; color: string; icon: string }[]

  if (links.length === 0) return null

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {links.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`flex items-center gap-2 px-6 py-3 ${link.color} text-white rounded-lg font-medium transition-colors`}
            >
              <span>{link.icon}</span>
              {link.label}
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
