"use client"

import { motion } from "framer-motion"

interface ServiceTimesProps {
  settings: Record<string, string>
}

export function ServiceTimes({ settings }: ServiceTimesProps) {
  const services = [
    { name: "주일예배", time: settings.sunday_main_time || "주일 오전 11:00", icon: "⛪" },
    { name: "주일학교", time: settings.sunday_school_time || "주일 오전 9:30", icon: "📚" },
    { name: "수요예배", time: settings.wednesday_time || "수요일 저녁 7:30", icon: "🙏" },
    { name: "금요예배", time: settings.friday_time || "금요일 저녁 8:00", icon: "✨" },
  ].filter((s) => s.time)

  if (settings.special_time) {
    services.push({ name: "특별예배", time: settings.special_time, icon: "🌟" })
  }

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
          <h2 className="text-3xl font-bold text-[#1e3a5f] mb-2">예배 시간</h2>
          <p className="text-gray-500">함께 예배하며 은혜를 나눕니다</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-xl p-6 text-center border border-gray-100 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-3 block">{service.icon}</span>
              <h3 className="font-bold text-[#1e3a5f] mb-1">{service.name}</h3>
              <p className="text-sm text-gray-600">{service.time}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
