"use client"

import { motion } from "framer-motion"

interface ServiceTimesProps {
  settings: Record<string, string>
}

const services = [
  { key: "sunday_main_time", label: "주일예배", day: "매주 일요일", default: "오전 11:00", icon: "church" },
  { key: "sunday_school_time", label: "주일학교", day: "매주 일요일", default: "오전 9:30", icon: "school" },
  { key: "wednesday_time", label: "수요예배", day: "매주 수요일", default: "저녁 7:30", icon: "auto_awesome" },
  { key: "friday_time", label: "금요예배", day: "매주 금요일", default: "저녁 8:00", icon: "nights_stay" },
]

export function ServiceTimes({ settings }: ServiceTimesProps) {
  return (
    <section className="py-24 px-6 lg:px-12 bg-[#f5f3f0]">
      <div className="max-w-screen-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#795900] font-bold text-sm tracking-widest uppercase">
            주간 모임 안내
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-[#022448] mt-2">
            예배 시간표
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-xl p-6 lg:p-8 flex items-center gap-5 shadow-sm border border-[#e4e2df]/50"
            >
              <div className="w-12 h-12 bg-[#022448] rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#ffdfa0] text-xl">
                  {service.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg text-[#022448] font-semibold">
                  {service.label}
                </h3>
                <p className="text-sm text-[#43474e] mt-0.5">{service.day}</p>
              </div>
              <p className="font-serif text-xl lg:text-2xl text-[#022448] font-bold shrink-0">
                {settings[service.key] || service.default}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
