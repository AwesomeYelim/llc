"use client"

import { motion } from "framer-motion"

export function KakaoMap({ address }: { address: string }) {
  const fullAddress = address || "충북 청주시 상당구 중고개로125번길 29"
  // 교회명으로 검색하면 네이버 지도에서 정확한 위치 핀이 찍힘
  const naverMapUrl = `https://map.naver.com/p/search/충북 청주시 상당구 중고개로125번길 29 생명의빛교회?c=17.00,0,0,0,dh`

  return (
    <section className="bg-[#f5f3f0] py-24 lg:py-32 px-6 lg:px-12">
      <div className="max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[#795900] font-bold text-sm tracking-widest uppercase">
            오시는 길
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#022448] mt-2">
            성전 안내
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Info - 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-white rounded-2xl p-8 lg:p-10 flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#022448] rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#ffdfa0] text-lg">
                    location_on
                  </span>
                </div>
                <div>
                  <h4 className="font-serif text-lg text-[#022448] font-semibold mb-1">주소</h4>
                  <p className="text-[#43474e] text-sm leading-relaxed">
                    {fullAddress}
                    <br />
                    생명의 빛 교회
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#022448] rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#ffdfa0] text-lg">
                    schedule
                  </span>
                </div>
                <div>
                  <h4 className="font-serif text-lg text-[#022448] font-semibold mb-1">예배 시간</h4>
                  <p className="text-[#43474e] text-sm">
                    주일예배 오전 11:00
                    <br />
                    수요예배 저녁 7:30
                  </p>
                </div>
              </div>
            </div>
            <a
              href="https://map.naver.com/p/search/충북 청주시 상당구 중고개로125번길 29 생명의빛교회"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#022448] font-bold hover:text-[#795900] transition-colors mt-8 text-sm"
            >
              네이버 지도에서 보기
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </a>
          </motion.div>

          {/* Map - 3 cols, sidebar hidden via CSS offset */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 relative h-[350px] lg:h-auto lg:min-h-[400px] rounded-2xl overflow-hidden shadow-lg"
          >
            <iframe
              src={naverMapUrl}
              style={{ border: 0, position: "absolute", top: 0, left: "-120px", width: "calc(100% + 120px)", height: "100%" }}
              allowFullScreen
              loading="lazy"
              title="교회 위치 - 네이버 지도"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
