"use client"

import { useEffect, useRef } from "react"

// 교회 좌표 (네이버 플레이스에서 확인)
const LAT = 36.6144323
const LNG = 127.5169728

export function ChurchMap() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    let map: import("leaflet").Map | null = null

    const init = async () => {
      const L = (await import("leaflet")).default

      // SSR 환경에서 아이콘 경로 오류 방지
      // @ts-expect-error _getIconUrl not in types
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      if (!mapRef.current) return

      map = L.map(mapRef.current, {
        center: [LAT, LNG],
        zoom: 17,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map)

      L.marker([LAT, LNG])
        .addTo(map)
        .bindPopup("<b>동남 생명의빛교회</b><br>충고개로125번길 29")
        .openPopup()
    }

    init()

    return () => {
      map?.remove()
    }
  }, [])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </>
  )
}
