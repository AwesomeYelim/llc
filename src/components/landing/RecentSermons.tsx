"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { formatDate, serviceTypeLabel, getYoutubeThumbnail } from "@/lib/utils"

interface Sermon {
  id: number
  title: string
  scripture: string
  sermonDate: Date | string
  serviceType: string
  youtubeId: string | null
}

export function RecentSermons({ sermons }: { sermons: Sermon[] }) {
  if (sermons.length === 0) return null

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#fbf9f6]">
      <div className="max-w-screen-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8"
        >
          <div className="max-w-xl">
            <span className="text-[#795900] font-bold text-sm tracking-widest uppercase">
              말씀과 지혜
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#022448] mt-4 mb-6">
              최신 설교
            </h2>
            <p className="text-[#43474e] text-lg">
              영적 성장과 성경적 진리를 위한 메시지들을 만나보세요.
            </p>
          </div>
          <Link
            href="/sermons"
            className="bg-[#efeeeb] text-[#022448] font-bold px-8 py-3 rounded-xl hover:bg-[#e4e2df] transition-all shrink-0"
          >
            전체 아카이브
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {sermons.map((sermon, i) => (
            <motion.div
              key={sermon.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <Link href={`/sermons/${sermon.id}`} className="group cursor-pointer block">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-6 bg-[#eae8e5]">
                  {sermon.youtubeId ? (
                    <Image
                      src={getYoutubeThumbnail(sermon.youtubeId)}
                      alt={sermon.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="material-symbols-outlined text-[#c4c6cf] text-6xl">
                        play_circle
                      </span>
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-[#022448]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-[#022448] shadow-xl">
                      <span
                        className="material-symbols-outlined text-4xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        play_arrow
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[#795900] font-bold text-xs tracking-widest uppercase">
                  {serviceTypeLabel(sermon.serviceType)}
                </span>
                <h3 className="font-serif text-xl lg:text-2xl text-[#022448] mt-2 group-hover:text-[#795900] transition-colors">
                  {sermon.title}
                </h3>
                <p className="text-[#43474e] mt-2 text-sm">{sermon.scripture}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-[#43474e]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    {formatDate(sermon.sermonDate)}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
