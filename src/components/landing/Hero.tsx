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
          src="/images/hero_bg.jpg"
          alt="동남 생명의 빛 교회 예배당"
          fill
          className="object-cover object-[center_70%]"
          priority
        />
        {/* 상단(아파트) 강하게 어둡게, 교회 건물·간판 부분은 살림 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to bottom,
                rgba(0,0,0,0.82) 0%,
                rgba(0,0,0,0.45) 38%,
                rgba(0,0,0,0.18) 58%,
                rgba(0,0,0,0.52) 100%
              )
            `,
          }}
        />
        {/* 텍스트 가독성용 좌측 페이드 */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 60%)`,
          }}
        />
      </motion.div>

      <motion.div style={{ y: textY }} className="relative z-10 px-6 lg:px-12 max-w-screen-2xl mx-auto w-full">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4"
          >
            동남 생명의 빛 교회
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-[#f6be39] text-lg md:text-2xl font-semibold mb-6"
          >
            &ldquo;하나님의 일을 성공시켜라&rdquo;
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-white/70 text-base md:text-lg mb-10 max-w-lg leading-relaxed"
          >
            이름을 불러주는 따뜻한 교회.
            <br />
            충북 청주시 상당구 중고개로125번길 29 · 담임목사 홍은익
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/about"
              className="bg-[#795900] text-white px-10 py-4 rounded-xl font-bold hover:brightness-110 transition-all"
            >
              교회 소개
            </Link>
            <Link
              href="/sermons"
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-xl font-bold hover:bg-white/20 transition-all"
            >
              설교 영상
            </Link>
          </motion.div>
        </div>
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
