import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/middleware"

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const user = (req as any).user

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        conversations: {
          include: {
            agent: true,
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        messagesUsed: userData.messagesUsed,
        messageLimit: userData.messageLimit,
        conversations: userData.conversations,
      },
    })
  } catch (error) {
    console.error("User fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
})

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Use /api/auth/register or /api/auth/login" }, { status: 400 })
}
