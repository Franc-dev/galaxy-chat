"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GalaxyBackground } from "@/components/galaxy-background"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Sparkles, MessageSquare, Brain, BookOpen, Shield, Users, Zap, Globe } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem("auth_token")
    const savedUser = localStorage.getItem("user_data")

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
  }, [])

  const handleGetStarted = () => {
    if (user) {
      router.push("/chat")
    } else {
      router.push("/signin")
    }
  }

  return (
    <>
      <GalaxyBackground />
      <div className="min-h-screen relative z-10">
        {/* Navigation */}
        <nav className="p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl">🌌</div>
              <h1 className="text-xl font-bold text-white">Galaxy Chat</h1>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-white/70">Welcome, {user.name}</span>
                  <Button
                    onClick={() => router.push("/chat")}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                  >
                    Open Chat
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/signin">
                    <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <GlassCard className="p-12">
              <div className="text-6xl mb-6">🌌</div>
              <h1 className="text-5xl font-bold text-white mb-6">
                AI-Powered Conversations
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  in the Cosmos
                </span>
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Experience the future of AI interaction with specialized agents, personal knowledge bases, and beautiful
                galaxy-themed interface. Start your cosmic conversation today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-4 text-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {user ? "Continue Chatting" : "Start Free"}
                </Button>
                {!user && (
                  <Link href="/signin">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="text-white/70 hover:text-white hover:bg-white/10 px-8 py-4 text-lg"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>

              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>10 free messages daily</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Real-time streaming</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Powerful Features</h2>
              <p className="text-white/70 text-lg">Everything you need for intelligent conversations</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <GlassCard className="p-6">
                <Brain className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Multiple AI Agents</h3>
                <p className="text-white/70">
                  Choose from specialized agents: General Assistant, Code Expert, Creative Writer, and Data Analyst.
                  Each with unique personalities and expertise.
                </p>
              </GlassCard>

              <GlassCard className="p-6">
                <BookOpen className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Knowledge Base</h3>
                <p className="text-white/70">
                  Add your own knowledge items with tags and content. Agents automatically use relevant information to
                  enhance their responses.
                </p>
              </GlassCard>

              <GlassCard className="p-6">
                <MessageSquare className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Real-time Streaming</h3>
                <p className="text-white/70">
                  Experience smooth, real-time conversations with AI streaming responses. No waiting, just natural
                  flowing dialogue.
                </p>
              </GlassCard>

              <GlassCard className="p-6">
                <Users className="w-12 h-12 text-yellow-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">User Management</h3>
                <p className="text-white/70">
                  Role-based access control with admin panels, user management, and customizable message limits for
                  different user types.
                </p>
              </GlassCard>

              <GlassCard className="p-6">
                <Globe className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Multiple Models</h3>
                <p className="text-white/70">
                  Automatic switching between free AI models including Mistral, Gemini, Llama, and more. Always
                  available, always free.
                </p>
              </GlassCard>

              <GlassCard className="p-6">
                <Shield className="w-12 h-12 text-red-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Secure & Private</h3>
                <p className="text-white/70">
                  Enterprise-grade security with JWT authentication, password hashing, and secure data handling. Your
                  conversations stay private.
                </p>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <GlassCard className="p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Cosmic Journey?</h2>
              <p className="text-white/70 text-lg mb-8">
                Join thousands of users exploring the future of AI conversation. Get started with 10 free messages
                today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-4 text-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {user ? "Continue to Chat" : "Get Started Free"}
                </Button>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="text-2xl">🌌</div>
                <span className="text-white font-semibold">Galaxy Chat</span>
              </div>

              <div className="flex items-center gap-6 text-white/60">
                <span>© 2024 Galaxy Chat. All rights reserved.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
