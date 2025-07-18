import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAdminAuth } from "@/lib/middleware"

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          messagesUsed: true,
          messageLimit: true,
          isActive: true,
          createdAt: true,
          lastReset: true,
          _count: {
            select: {
              conversations: true,
              knowledgeBase: true,
            },
          },
        },
      }),
      prisma.user.count(),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
})

export const PUT = withAdminAuth(async (req: NextRequest) => {
  try {
    const { userId, messageLimit, isActive, role } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const updateData: any = {}
    if (messageLimit !== undefined) updateData.messageLimit = messageLimit
    if (isActive !== undefined) updateData.isActive = isActive
    if (role !== undefined) updateData.role = role

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        messagesUsed: true,
        messageLimit: true,
        isActive: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
})
