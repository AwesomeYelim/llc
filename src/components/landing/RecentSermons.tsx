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
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-[#1e3a5f] mb-2">최근 설교</h2>
          <p className="text-gray-500">말씀을 통해 은혜를 나눕니다</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sermons.map((sermon, i) => (
            <motion.div
              key={sermon.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <Link
                href={`/sermons/${sermon.id}`}
                className="block bg-[#faf8f5] rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative aspect-video bg-gray-200">
                  {sermon.youtubeId ? (
                    <Image
                      src={getYoutubeThumbnail(sermon.youtubeId)}
                      alt={sermon.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 text-5xl">
                      🎬
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-[#d4a017] font-medium mb-1">
                    {serviceTypeLabel(sermon.serviceType)}
                  </p>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                    {sermon.title}
                  </h3>
                  <p className="text-sm text-gray-500">{sermon.scripture}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(sermon.sermonDate)}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            href="/sermons"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2a4a73] transition-colors"
          >
            모든 설교 보기 →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
