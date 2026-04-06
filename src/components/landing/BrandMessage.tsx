"use client"

import { motion } from "framer-motion"

export function BrandMessage() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#1e3a5f] mb-6 leading-tight">
            이름을 불러주는 교회
          </h2>
          <div className="w-16 h-1 bg-[#d4a017] mx-auto mb-8" />
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            15명의 가족이 서로의 이름을 부르며,
            <br className="hidden md:block" />
            하나님의 사랑 안에서 함께 성장하는 공동체입니다.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { icon: "📖", title: "말씀 중심", desc: "하나님의 말씀 위에 세워지는 신앙" },
            { icon: "🤝", title: "가족 공동체", desc: "서로 돌보는 따뜻한 교제" },
            { icon: "🙏", title: "예배 헌신", desc: "온 마음으로 드리는 참된 예배" },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <span className="text-4xl mb-4 block">{item.icon}</span>
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
