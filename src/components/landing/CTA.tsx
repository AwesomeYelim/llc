"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-[#022448] rounded-xl p-12 lg:p-16 text-center text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#795900]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h2 className="font-serif text-3xl md:text-4xl mb-8 relative z-10">
          생명의 빛을 경험하세요
        </h2>
        <p className="text-[#8aa4cf] text-lg mb-10 max-w-2xl mx-auto relative z-10">
          작지만 따뜻한 가족 공동체, 동남 생명의 빛 교회에서
          <br />
          하나님의 사랑을 경험해 보세요.
        </p>
        <div className="flex flex-wrap justify-center gap-6 relative z-10">
          <Link
            href="/about"
            className="bg-[#795900] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#ffc641] hover:text-[#022448] transition-all"
          >
            교회 소개
          </Link>
          <Link
            href="/sermons"
            className="border border-[#c4c6cf]/30 text-white px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
          >
            설교 영상
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
