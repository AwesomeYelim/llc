"use client"

import { motion } from "framer-motion"

export function KakaoMap({ address }: { address: string }) {
  const mapQuery = encodeURIComponent(address || "충북 청주시 상당구 동남생명의빛교회")

  return (
    <section className="bg-[#f5f3f0] py-24 lg:py-32 px-6 lg:px-12">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#795900] font-bold text-sm tracking-widest uppercase">
            오시는 길
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#022448] mt-4 mb-8">
            성전 안내
          </h2>
          <div className="space-y-10 mb-12">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[#795900]">
                  location_on
                </span>
              </div>
              <div>
                <h4 className="font-serif text-xl text-[#022448] mb-1">위치</h4>
                <p className="text-[#43474e] leading-relaxed">
                  {address || "충북 청주시 상당구"}
                  <br />
                  동남생명의빛교회
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[#795900]">
                  schedule
                </span>
              </div>
              <div>
                <h4 className="font-serif text-xl text-[#022448] mb-1">
                  예배 시간
                </h4>
                <p className="text-[#43474e]">
                  주일예배 오전 11:00
                  <br />
                  수요예배 저녁 7:30
                </p>
              </div>
            </div>
          </div>
          <a
            href={`https://map.kakao.com/?q=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#022448] font-bold hover:text-[#795900] transition-colors"
          >
            카카오맵에서 보기
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
        >
          <iframe
            src={`https://map.kakao.com/?q=${mapQuery}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="교회 위치"
          />
        </motion.div>
      </div>
    </section>
  )
}
