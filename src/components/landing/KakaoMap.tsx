"use client"

import { motion } from "framer-motion"

export function KakaoMap({ address }: { address: string }) {
  return (
    <section className="py-20 px-4 bg-[#faf8f5]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-[#1e3a5f] mb-2">오시는 길</h2>
          <p className="text-gray-500">{address || "충북 청주시 상당구"}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-xl overflow-hidden border border-gray-200 bg-white"
        >
          <iframe
            src={`https://map.kakao.com/?q=${encodeURIComponent(address || "충북 청주시 상당구 동남생명의빛교회")}`}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="교회 위치"
          />
        </motion.div>

        <div className="mt-6 text-center">
          <a
            href={`https://map.kakao.com/?q=${encodeURIComponent(address || "동남생명의빛교회")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#1e3a5f] hover:underline"
          >
            카카오맵에서 보기 →
          </a>
        </div>
      </div>
    </section>
  )
}
