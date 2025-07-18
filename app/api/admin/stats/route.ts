import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAdminAuth } from "@/lib/middleware"

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const [totalUsers, activeUsers, totalConversations, totalMessages, knowledgeItems, todayMessages] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.conversation.count(),
        prisma.message.count(),
        prisma.knowledgeBase.count(),
        prisma.message.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ])

    // Get usage by model
    const modelUsage = await prisma.message.groupBy({
      by: ["model"],
      _count: {
        model: true,
      },
      where: {
        model: { not: null },
      },
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalConversations,
        totalMessages,
        knowledgeItems,
        todayMessages,
        modelUsage: modelUsage.map((m) => ({
          model: m.model,
          count: m._count.model,
        })),
      },
    })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
})
