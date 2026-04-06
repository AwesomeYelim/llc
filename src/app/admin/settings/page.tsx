"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input, Textarea } from "@/components/ui/Input"

const settingFields = [
  { key: "church_name", label: "교회명", type: "text" },
  { key: "church_address", label: "교회 주소", type: "text" },
  { key: "church_phone", label: "전화번호", type: "text" },
  { key: "pastor_name", label: "담임목사", type: "text" },
  { key: "vision", label: "비전", type: "text" },
  { key: "youtube_url", label: "유튜브 채널 URL", type: "text" },
  { key: "blog_url", label: "블로그 URL", type: "text" },
  { key: "sunday_main_time", label: "주일예배 시간", type: "text" },
  { key: "sunday_school_time", label: "주일학교 시간", type: "text" },
  { key: "wednesday_time", label: "수요예배 시간", type: "text" },
  { key: "friday_time", label: "금요예배 시간", type: "text" },
  { key: "special_time", label: "특별예배 시간", type: "text" },
  { key: "church_description", label: "교회 소개", type: "textarea" },
  { key: "pastor_bio", label: "목사님 소개", type: "textarea" },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings)
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert("저장에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">사이트 설정</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">저장되었습니다!</span>}
          <Button onClick={handleSave} loading={loading}>
            저장
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 max-w-2xl">
        {settingFields.map((field) => (
          <div key={field.key}>
            {field.type === "textarea" ? (
              <Textarea
                id={field.key}
                label={field.label}
                value={settings[field.key] || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                rows={4}
              />
            ) : (
              <Input
                id={field.key}
                label={field.label}
                value={settings[field.key] || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
              />
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
