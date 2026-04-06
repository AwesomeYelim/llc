"use client"

import { motion } from "framer-motion"

interface QuickLinksProps {
  youtubeUrl?: string
  blogUrl?: string
}

export function QuickLinks({ youtubeUrl, blogUrl }: QuickLinksProps) {
  const links = [
    youtubeUrl && {
      label: "유튜브 채널",
      href: youtubeUrl,
      icon: "play_circle",
      desc: "설교 영상을 유튜브에서 시청하세요",
    },
    blogUrl && {
      label: "네이버 블로그",
      href: blogUrl,
      icon: "edit_note",
      desc: "목사님의 블로그 글을 읽어보세요",
    },
  ].filter(Boolean) as { label: string; href: string; icon: string; desc: string }[]

  if (links.length === 0) return null

  return (
    <section className="py-16 px-6 lg:px-12 bg-[#fbf9f6]">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {links.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-6 bg-white p-8 rounded-xl border border-[#c4c6cf]/20 hover:shadow-md hover:border-[#795900]/30 transition-all group"
            >
              <div className="w-14 h-14 bg-[#f5f3f0] rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#795900] transition-colors">
                <span className="material-symbols-outlined text-[#022448] text-2xl group-hover:text-white transition-colors">
                  {link.icon}
                </span>
              </div>
              <div>
                <h3 className="font-serif text-xl text-[#022448] group-hover:text-[#795900] transition-colors">
                  {link.label}
                </h3>
                <p className="text-sm text-[#43474e] mt-1">{link.desc}</p>
              </div>
              <span className="material-symbols-outlined text-[#c4c6cf] ml-auto group-hover:text-[#795900] transition-colors">
                arrow_forward
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
