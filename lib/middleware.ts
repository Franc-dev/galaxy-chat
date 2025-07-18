import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./auth"

export function withAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    // Add user to request
    ;(req as any).user = user
    return handler(req, ...args)
  }
}

export function withAdminAuth(handler: Function) {
  return withAuth(async (req: NextRequest, ...args: any[]) => {
    const user = (req as any).user

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    return handler(req, ...args)
  })
}
