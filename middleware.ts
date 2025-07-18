import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

// Define public routes that don't require authentication
const publicRoutes = ["/", "/signin", "/signup"]

// Define protected routes that require authentication
const protectedRoutes = ["/chat"]

// Define admin routes that require admin privileges
const adminRoutes = ["/admin"]

// Define auth routes that should redirect if already authenticated
const authRoutes = ["/signin", "/signup"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  // Check if user is authenticated
  let user = null
  if (token) {
    try {
      user = await verifyToken(token)
    } catch (error) {
      // Invalid token, treat as unauthenticated
      user = null
    }
  }

  // Handle API routes
  if (pathname.startsWith("/api/")) {
    return handleApiRoutes(request, pathname, user)
  }

  // Handle auth routes (signin, signup)
  if (authRoutes.includes(pathname)) {
    if (user) {
      // User is already authenticated, redirect to chat
      return NextResponse.redirect(new URL("/chat", request.url))
    }
    // Allow access to auth routes for unauthenticated users
    return NextResponse.next()
  }

  // Handle protected routes
  if (protectedRoutes.includes(pathname)) {
    if (!user) {
      // User is not authenticated, redirect to signin
      const signInUrl = new URL("/signin", request.url)
      signInUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(signInUrl)
    }
    // User is authenticated, allow access
    return NextResponse.next()
  }

  // Handle admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      // User is not authenticated, redirect to signin
      const signInUrl = new URL("/signin", request.url)
      signInUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(signInUrl)
    }

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      // User is not admin, redirect to chat
      return NextResponse.redirect(new URL("/chat", request.url))
    }

    // User is admin, allow access
    return NextResponse.next()
  }

  // Handle public routes and homepage
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Handle unknown routes - redirect to homepage
  if (!publicRoutes.includes(pathname) && !protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

function handleApiRoutes(request: NextRequest, pathname: string, user: any) {
  // Public API routes that don't require authentication
  const publicApiRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/agents", // Allow fetching agents without auth for homepage
  ]

  // Admin API routes that require admin privileges
  const adminApiRoutes = [
    "/api/admin/",
    "/api/agents", // POST requests to create agents
  ]

  // Check if it's a public API route
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check authentication for protected API routes
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // Check admin privileges for admin API routes
  if (adminApiRoutes.some((route) => pathname.startsWith(route))) {
    if (request.method === "POST" && pathname === "/api/agents") {
      // Creating agents requires admin privileges
      if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
      }
    }

    if (pathname.startsWith("/api/admin/")) {
      if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
      }
    }
  }

  // Add user info to request headers for API routes
  const response = NextResponse.next()
  response.headers.set("x-user-id", user.id)
  response.headers.set("x-user-role", user.role)
  response.headers.set("x-user-email", user.email)

  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
