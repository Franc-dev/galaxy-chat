"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GalaxyBackground } from "@/components/galaxy-background"
import { AdminPanel } from "@/components/admin-panel"

export default function AdminPage() {
  const [token, setToken] = useState<string>("")
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token")
    const savedUser = localStorage.getItem("user_data")

    if (!savedToken || !savedUser) {
      router.push("/signin")
      return
    }

    try {
      const userData = JSON.parse(savedUser)
      if (userData.role !== "ADMIN" && userData.role !== "SUPER_ADMIN") {
        router.push("/chat")
        return
      }

      setToken(savedToken)
      setUser(userData)
    } catch (error) {
      router.push("/signin")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <>
        <GalaxyBackground />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-4">🌌</div>
            <p>Loading Admin Panel...</p>
          </div>
        </div>
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <GalaxyBackground />
      <div className="min-h-screen p-4">
        <AdminPanel isOpen={true} onClose={() => router.push("/chat")} token={token} />
      </div>
    </>
  )
}
