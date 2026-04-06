"use client"

import { motion } from "framer-motion"

interface ServiceTimesProps {
  settings: Record<string, string>
}

export function ServiceTimes({ settings }: ServiceTimesProps) {
  return (
    <section className="py-24 px-6 lg:px-12 bg-[#f5f3f0]">
      <div className="max-w-screen-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4"
        >
          <div>
            <span className="text-[#795900] font-bold text-sm tracking-widest uppercase">
              주간 모임 안내
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#022448] mt-2">
              예배 시간표
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sunday Main - Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 bg-white p-8 lg:p-12 rounded-xl shadow-sm flex flex-col justify-between min-h-[350px] border border-[#c4c6cf]/10"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="material-symbols-outlined text-[#795900] text-4xl">
                  church
                </span>
                <h3 className="font-serif text-2xl lg:text-3xl text-[#022448]">
                  주일 예배
                </h3>
              </div>
              <p className="text-[#43474e] text-lg max-w-md leading-relaxed mb-8">
                찬양과 말씀, 교제가 있는 우리 교회의 메인 예배입니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="block text-[#795900] font-bold text-xs uppercase tracking-widest mb-2">
                  주일예배
                </span>
                <p className="text-2xl font-serif text-[#022448]">
                  {settings.sunday_main_time || "오전 11:00"}
                </p>
              </div>
              <div>
                <span className="block text-[#795900] font-bold text-xs uppercase tracking-widest mb-2">
                  주일학교
                </span>
                <p className="text-2xl font-serif text-[#022448]">
                  {settings.sunday_school_time || "오전 9:30"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Wednesday - Dark Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#022448] text-white p-8 lg:p-12 rounded-xl flex flex-col justify-between shadow-lg"
          >
            <div>
              <span className="material-symbols-outlined text-[#ffdfa0] text-4xl mb-6">
                auto_awesome
              </span>
              <h3 className="font-serif text-2xl lg:text-3xl mb-4">
                수요 예배
              </h3>
              <p className="text-[#8aa4cf] text-lg">
                말씀과 기도로 영혼을 새롭게 하는 시간입니다.
              </p>
            </div>
            <div className="mt-8">
              <p className="text-3xl font-serif">
                {settings.wednesday_time || "저녁 7:30"}
              </p>
              <p className="text-[#ffdfa0] font-semibold">매주 수요일</p>
            </div>
          </motion.div>

          {/* Friday */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#e4e2df] p-8 lg:p-12 rounded-xl flex flex-col justify-between min-h-[250px]"
          >
            <div>
              <h3 className="font-serif text-2xl text-[#022448] mb-4">
                금요 예배
              </h3>
              <p className="text-[#43474e]">
                한 주를 마무리하며 하나님 앞에 나아가는 예배입니다.
              </p>
            </div>
            <div className="mt-6">
              <p className="text-xl font-serif text-[#022448]">
                {settings.friday_time || "저녁 8:00"}
              </p>
              <p className="text-sm text-[#43474e] mt-1">매주 금요일</p>
            </div>
          </motion.div>

          {/* Special / Small Groups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 bg-[#f5f3f0] p-8 lg:p-12 rounded-xl border border-[#c4c6cf]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div>
              <h3 className="font-serif text-2xl text-[#022448] mb-2">
                가족 공동체
              </h3>
              <p className="text-[#43474e]">
                서로의 이름을 불러주며, 가족처럼 교제하는 소중한 공동체입니다.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#795900] font-semibold shrink-0">
              <span className="material-symbols-outlined">diversity_3</span>
              따뜻한 가족
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
