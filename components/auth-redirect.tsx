"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface AuthRedirectProps {
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthRedirect({ requireAuth = true, redirectTo = "/signin" }: AuthRedirectProps) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const user = localStorage.getItem("user_data")

    if (requireAuth && (!token || !user)) {
      router.push(redirectTo)
    } else if (!requireAuth && token && user) {
      router.push("/chat")
    }
  }, [requireAuth, redirectTo, router])

  return null
}
