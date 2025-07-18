import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureAgentsExist } from "@/lib/auth-utils"

export async function GET() {
  try {
    // Ensure default agents exist
    await ensureAgentsExist()

    const agents = await prisma.agent.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ agents })
  } catch (error) {
    console.error("Agents fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, systemPrompt, avatar } = await req.json()

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        systemPrompt,
        avatar: avatar || "🤖",
      },
    })

    return NextResponse.json({ agent })
  } catch (error) {
    console.error("Agent creation error:", error)
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 })
  }
}
