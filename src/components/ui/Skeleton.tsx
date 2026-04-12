import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#e4e2df] rounded-xl",
        className
      )}
    />
  )
}
