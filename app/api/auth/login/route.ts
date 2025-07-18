import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, generateToken } from "@/lib/auth"
import { initializeDefaultAdmin } from "@/lib/auth-utils"
import { setAuthCookie } from "@/lib/cookie-utils"

export async function POST(req: NextRequest) {
  try {
    // Initialize default admin if needed
    await initializeDefaultAdmin()

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Create response
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        messagesUsed: user.messagesUsed,
        messageLimit: user.messageLimit,
      },
      token,
    })

    // Set HTTP-only cookie
    setAuthCookie(response, token)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
