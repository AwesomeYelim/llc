"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 600], ["0%", "30%"])
  const textY = useTransform(scrollY, [0, 600], ["0%", "-15%"])

  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
      {/* Background photo with parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <Image
          src="/images/hero_bg2.png"
          alt="동남 생명의 빛 교회 예배당"
          fill
          className="object-cover object-center"
          priority
        />
        {/* 하단만 어둡게, 사진 본체는 최대한 살림 */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.60) 100%)`,
          }}
        />
      </motion.div>

      {/* 하단 텍스트 영역 */}
      <motion.div
        style={{ y: textY }}
        className="absolute bottom-16 left-0 right-0 z-10 px-6 lg:px-12 max-w-screen-2xl mx-auto w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          {/* 교회명 + 태그라인 */}
          <div>
            <p className="text-white/60 text-xs tracking-widest uppercase mb-1">Dongnam Church of Light</p>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight">
              동남 생명의 빛 교회
            </h1>
            <p className="text-[#f6be39] text-sm mt-1">&ldquo;하나님의 일을 성공시켜라&rdquo;</p>
          </div>

          {/* 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex gap-3"
          >
            <Link
              href="/about"
              className="bg-[#795900] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all"
            >
              교회 소개
            </Link>
            <Link
              href="/sermons"
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-white/20 transition-all"
            >
              설교 영상
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1"
        >
          <div className="w-1.5 h-3 rounded-full bg-white/50" />
        </motion.div>
      </motion.div>
    </section>
  )
}
