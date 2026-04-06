"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-20 px-4 bg-[#1e3a5f]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            방문을 환영합니다
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            작지만 따뜻한 가족 공동체, 동남생명의빛교회에서
            <br />
            하나님의 사랑을 경험해 보세요.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/about"
              className="px-8 py-3 bg-[#d4a017] text-white rounded-lg font-medium hover:bg-[#c49315] transition-colors"
            >
              교회 소개 보기
            </Link>
            <Link
              href="/sermons"
              className="px-8 py-3 border-2 border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              설교 영상 보기
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
