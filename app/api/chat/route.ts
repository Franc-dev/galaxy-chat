/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { openrouter, getAvailableModel } from "@/lib/openrouter"
import { prisma } from "@/lib/prisma"
import { formatKnowledgeForPrompt, extractRelevantKnowledge } from "@/lib/knowledge-utils"
import { withAuth } from "@/lib/middleware"

export const maxDuration = 60

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const { messages, agentId, conversationId } = await req.json()
    const user = (req as any).user

    if (!agentId) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 })
    }

    // Get user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!userData || !userData.isActive) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 404 })
    }

    // Reset daily limit if needed
    const now = new Date()
    const lastReset = new Date(userData.lastReset)
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)

    if (hoursSinceReset >= 24) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          messagesUsed: 0,
          lastReset: now,
        },
      })
      userData.messagesUsed = 0
    }

    // Check if user has exceeded their limit (admins get unlimited)
    if (userData.role === "USER" && userData.messagesUsed >= userData.messageLimit) {
      return NextResponse.json(
        {
          error: "Daily message limit exceeded. Please try again tomorrow or contact an administrator.",
        },
        { status: 429 },
      )
    }

    // Get agent and knowledge base
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get relevant knowledge for the agent
    const knowledgeItems = await prisma.knowledgeBase.findMany({
      where: {
        OR: [{ agentId: agentId }, { userId: user.id, agentId: null }],
      },
    })

    // Extract relevant knowledge based on the latest user message
    const latestUserMessage = messages[messages.length - 1]?.content || ""
    const relevantKnowledge = extractRelevantKnowledge(latestUserMessage, knowledgeItems)
    const knowledgePrompt = formatKnowledgeForPrompt(relevantKnowledge)

    // Enhanced system prompt with knowledge
    const enhancedSystemPrompt = `${agent.systemPrompt}${knowledgePrompt}`

    // Get available model
    const model = await getAvailableModel()

    // Create or update conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          agentId,
          title: latestUserMessage.slice(0, 50) + (latestUserMessage.length > 50 ? "..." : ""),
        },
      })
    }

    // Save user message
    await prisma.message.create({
      data: {
        content: latestUserMessage,
        role: "USER",
        conversationId: conversation.id,
        model,
      },
    })

    // Increment user's message count (only for regular users)
    if (userData.role === "USER") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          messagesUsed: userData.messagesUsed + 1,
        },
      })
      // Fetch updated user data for accurate messagesRemaining
      userData.messagesUsed = userData.messagesUsed + 1;
    }

    // Stream response
    const result = streamText({
      model: openrouter(model),
      system: enhancedSystemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Save assistant message after streaming completes
    result.text
      .then(async (fullText) => {
        await prisma.message.create({
          data: {
            content: fullText,
            role: "ASSISTANT",
            conversationId: conversation.id,
            model,
          },
        })
      })
      .catch(console.error)

    const messagesRemaining = userData.role === "USER" ? userData.messageLimit - userData.messagesUsed : 999;

    return result.toDataStreamResponse({
      headers: {
        "X-Conversation-Id": conversation.id,
        "X-Messages-Remaining": String(messagesRemaining),
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
})

export async function PUT(req: NextRequest) {
  try {
    const { messageId, content } = await req.json();
    if (!messageId || typeof content !== "string") {
      return NextResponse.json({ error: "Message ID and content are required" }, { status: 400 });
    }
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content, status: "EDITED" }
    });
    return NextResponse.json({ message: updated });
  } catch (error) {
    console.error("Message update error:", error);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("messageId");
    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }
    try {
      await prisma.message.delete({ where: { id: messageId } });
      return NextResponse.json({ success: true });
    } catch (error: any) {
      if (error.code === 'P2025') {
        // No record found, treat as success (idempotent delete)
        return NextResponse.json({ success: true });
      }
      throw error;
    }
  } catch (error) {
    console.error("Message deletion error:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
