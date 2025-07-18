import { type NextRequest, NextResponse } from "next/server"

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from cookie first
  const cookieToken = request.cookies.get("auth_token")?.value
  if (cookieToken) return cookieToken

  // Try to get token from Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  return null
}

export function createAuthResponse(message: string, status: number, redirectUrl?: string): NextResponse {
  if (redirectUrl) {
    return NextResponse.redirect(new URL(redirectUrl, "http://localhost:3000"))
  }

  return NextResponse.json({ error: message }, { status })
}

export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/api/auth/login",
    "/api/auth/register",
    "/api/agents", // GET requests only
  ]

  return publicRoutes.some((route) => {
    if (route === pathname) return true
    if (route.endsWith("/") && pathname.startsWith(route)) return true
    return false
  })
}

export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ["/chat"]
  return protectedRoutes.some((route) => pathname.startsWith(route))
}

export function isAdminRoute(pathname: string): boolean {
  const adminRoutes = ["/admin", "/api/admin"]
  return adminRoutes.some((route) => pathname.startsWith(route))
}

export function isAuthRoute(pathname: string): boolean {
  const authRoutes = ["/signin", "/signup"]
  return authRoutes.includes(pathname)
}

export function shouldRedirectAuthenticated(pathname: string): boolean {
  return isAuthRoute(pathname)
}

export function createRedirectResponse(
  request: NextRequest,
  redirectPath: string,
  preserveQuery = false,
): NextResponse {
  const url = new URL(redirectPath, request.url)

  if (preserveQuery) {
    // Preserve current query parameters
    const currentParams = request.nextUrl.searchParams
    currentParams.forEach((value, key) => {
      url.searchParams.set(key, value)
    })
  }

  return NextResponse.redirect(url)
}

export function addUserToHeaders(response: NextResponse, user: any): NextResponse {
  if (user) {
    response.headers.set("x-user-id", user.id)
    response.headers.set("x-user-role", user.role)
    response.headers.set("x-user-email", user.email)
    if (user.name) {
      response.headers.set("x-user-name", user.name)
    }
  }
  return response
}

export function logMiddlewareAction(action: string, pathname: string, user?: any): void {
  if (process.env.NODE_ENV === "development") {
    const userInfo = user ? `${user.email} (${user.role})` : "anonymous"
    console.log(`🛡️ Middleware: ${action} - ${pathname} - ${userInfo}`)
  }
}
