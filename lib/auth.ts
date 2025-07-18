import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { prisma } from "./prisma"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key"
const encoder = new TextEncoder()
const JWT_SECRET_KEY = encoder.encode(JWT_SECRET)

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(user: AuthUser): Promise<string> {
  return await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET_KEY)
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY)
    return {
      id: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string | null,
      role: payload.role as string,
    }
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function createDefaultAdmin() {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "jose@admin.com"
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123"
  const adminName = process.env.DEFAULT_ADMIN_NAME || "Jose"

  try {
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

      console.log("✅ Default admin created:", adminEmail)
      return true
    }

    console.log("ℹ️ Admin user already exists:", adminEmail)
    return false
  } catch (error) {
    console.error("❌ Failed to create default admin:", error)
    return false
  }
}

// Utility function to get user from request (for API routes)
export function getUserFromRequest(request: Request): AuthUser | null {
  const userId = request.headers.get("x-user-id")
  const userRole = request.headers.get("x-user-role")
  const userEmail = request.headers.get("x-user-email")
  const userName = request.headers.get("x-user-name")

  if (userId && userRole && userEmail) {
    return {
      id: userId,
      email: userEmail,
      name: userName,
      role: userRole,
    }
  }

  return null
}
