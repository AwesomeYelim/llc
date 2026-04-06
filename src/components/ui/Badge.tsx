import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "primary" | "success" | "warning" | "danger"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-[#1e3a5f]/10 text-[#1e3a5f]",
    success: "bg-green-100 text-green-700",
    warning: "bg-[#d4a017]/10 text-[#b3860f]",
    danger: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
