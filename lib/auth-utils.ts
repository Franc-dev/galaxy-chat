import { prisma } from "./prisma"
import { hashPassword } from "./auth"

export async function initializeDefaultAdmin() {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "jose@admin.com"
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123"
    const adminName = process.env.DEFAULT_ADMIN_NAME || "Jose"

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (!existingAdmin) {
      const hashedPassword = await hashPassword(adminPassword)

      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: "SUPER_ADMIN",
          messageLimit: 1000,
          isActive: true,
        },
      })

      console.log(`✅ Default admin created: ${adminEmail}`)
      return true
    }

    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
    return false
  } catch (error) {
    console.error("❌ Failed to create default admin:", error)
    return false
  }
}

export async function ensureAgentsExist() {
  try {
    const agentCount = await prisma.agent.count()

    if (agentCount === 0) {
      const { DEFAULT_AGENTS } = await import("./agents")

      await prisma.agent.createMany({
        data: DEFAULT_AGENTS.map((agent) => ({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          systemPrompt: agent.systemPrompt,
          avatar: agent.avatar,
          isActive: true,
        })),
      })

      console.log(`✅ Created ${DEFAULT_AGENTS.length} default agents`)
      return true
    }

    console.log(`ℹ️  Agents already exist (${agentCount} found)`)
    return false
  } catch (error) {
    console.error("❌ Failed to create default agents:", error)
    return false
  }
}
