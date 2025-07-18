import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const agentId = searchParams.get("agentId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const knowledge = await prisma.knowledgeBase.findMany({
      where: {
        userId,
        ...(agentId && { agentId }),
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ knowledge })
  } catch (error) {
    console.error("Knowledge fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch knowledge" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, tags, userId, agentId } = await req.json()

    if (!title || !content || !userId) {
      return NextResponse.json({ error: "Title, content, and userId are required" }, { status: 400 })
    }

    const knowledge = await prisma.knowledgeBase.create({
      data: {
        title,
        content,
        tags: tags || [],
        userId,
        agentId: agentId || null,
      },
    })

    return NextResponse.json({ knowledge })
  } catch (error) {
    console.error("Knowledge creation error:", error)
    return NextResponse.json({ error: "Failed to create knowledge" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Knowledge ID is required" }, { status: 400 })
    }

    await prisma.knowledgeBase.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Knowledge deletion error:", error)
    return NextResponse.json({ error: "Failed to delete knowledge" }, { status: 500 })
  }
}
