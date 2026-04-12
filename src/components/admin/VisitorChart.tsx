"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface DayData {
  date: string
  count: number
}

interface PageData {
  path: string
  count: number
}

export function VisitorChart({
  dailyData,
  topPages,
}: {
  dailyData: DayData[]
  topPages: PageData[]
}) {
  return (
    <div className="space-y-6">
      {/* Daily chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">최근 7일 방문자</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                fontSize: "12px",
              }}
              labelStyle={{ fontWeight: 600, color: "#111827" }}
              cursor={{ fill: "#f3f4f6" }}
            />
            <Bar dataKey="count" name="방문수" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top pages */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">인기 페이지</h2>
        <div className="space-y-2">
          {topPages.map((page, idx) => (
            <div key={page.path} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-4 text-right">{idx + 1}</span>
              <span className="text-sm text-gray-700 flex-1 truncate font-mono">{page.path}</span>
              <span className="text-sm font-medium text-[#1e3a5f] tabular-nums">{page.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
