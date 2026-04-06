import { cn } from "@/lib/utils"
import Image from "next/image"

interface CardProps {
  className?: string
  children: React.ReactNode
  hover?: boolean
}

export function Card({ className, children, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden",
        hover && "hover:shadow-md transition-shadow duration-300",
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full aspect-video">
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
    </div>
  )
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900 mb-2">{children}</h3>
}
