import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl relative",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50 before:pointer-events-none before:-z-10",
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}
