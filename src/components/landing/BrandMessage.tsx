"use client"

import { motion } from "framer-motion"

export function BrandMessage() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-[#fbf9f6]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="w-px h-16 bg-[#795900] mx-auto mb-8" />
        <blockquote className="font-serif text-2xl md:text-4xl text-[#022448] leading-relaxed italic">
          &ldquo;하나님의 일을 성공시켜라&rdquo;
        </blockquote>
        <p className="mt-6 text-[#795900] font-semibold uppercase tracking-widest text-sm">
          — 동남 생명의 빛 교회 비전
        </p>
        <p className="mt-8 text-[#43474e] text-lg leading-relaxed max-w-2xl mx-auto">
          서로의 이름을 부르며, 하나님의 사랑 안에서 함께
          성장하는 가족 공동체입니다.
        </p>
      </motion.div>
    </section>
  )
}
