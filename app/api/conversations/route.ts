import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const conversationId = searchParams.get("conversationId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (conversationId) {
      // Get specific conversation with messages
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId, userId },
        include: {
          agent: true,
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      })

      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      return NextResponse.json({ conversation })
    } else {
      // Get all conversations for user
      const conversations = await prisma.conversation.findMany({
        where: { userId },
        include: {
          agent: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
      })

      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error("Conversations fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, agentId } = await req.json();

    if (!userId || !agentId) {
      return NextResponse.json({ error: "User ID and Agent ID are required" }, { status: 400 });
    }

    // Only return an existing conversation if it has at least one message
    let conversation = await prisma.conversation.findFirst({
      where: { userId, agentId, messages: { some: {} } },
      include: { agent: true, messages: { orderBy: { createdAt: "asc" } } }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          agentId,
          title: "New Conversation"
        },
        include: { agent: true, messages: { orderBy: { createdAt: "asc" } } }
      });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Conversation creation error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("conversationId")
    const userId = searchParams.get("userId")

    if (!conversationId || !userId) {
      return NextResponse.json({ error: "Conversation ID and User ID are required" }, { status: 400 })
    }

    await prisma.conversation.delete({
      where: {
        id: conversationId,
        userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Conversation deletion error:", error)
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}
