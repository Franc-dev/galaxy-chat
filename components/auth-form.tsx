"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassCard } from "@/components/glass-card"
import { Eye, EyeOff, Sparkles, UserPlus, LogIn } from "lucide-react"

interface AuthFormProps {
  onAuth: (user: any, token: string) => void
}

export function AuthForm({ onAuth }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        onAuth(data.user, data.token)
      } else {
        setError(data.error || "Authentication failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="relative z-10">
      <GlassCard className="w-full max-w-md p-8 relative z-20">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🌌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Galaxy Chat</h1>
          <p className="text-white/70">AI-powered conversations in the cosmos</p>
        </div>

        <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-6 relative z-30">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 text-sm px-4 py-2 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
              isLogin ? "bg-white/20 text-white shadow-lg" : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 text-sm px-4 py-2 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
              !isLogin ? "bg-white/20 text-white shadow-lg" : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-30">
          {!isLogin && (
            <Input
              name="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20"
            />
          )}

          <Input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleInputChange}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20"
            required
          />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-12 focus:border-white/40 focus:ring-2 focus:ring-white/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-40"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 py-3 text-base font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative z-30"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-white/50">
          <p>✨ 10 free messages per day</p>
          <p>🤖 Multiple AI agents</p>
          <p>📚 Personal knowledge base</p>
        </div>

        {isLogin && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-300 text-center">
              <strong>Admin Demo:</strong> jose@admin.com / admin123
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
