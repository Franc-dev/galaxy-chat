"use client"

import Link from "next/link"
import { GalaxyBackground } from "@/components/galaxy-background"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <>
      <GalaxyBackground />
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <GlassCard className="p-12 text-center max-w-md">
          <div className="text-6xl mb-6">🌌</div>
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <h2 className="text-xl font-semibold text-white mb-4">Lost in Space</h2>
          <p className="text-white/70 mb-8">
            The page you're looking for has drifted into the cosmic void. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>

            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </GlassCard>
      </div>
    </>
  )
}
