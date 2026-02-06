import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/", "/groups"];

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/profile", "/onboarding"];

// Check if path matches any route pattern
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match
    if (pathname === route) return true;
    // Prefix match for nested routes (e.g., /groups/123)
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });
}

// Check if path is a protected route
function isProtectedRoute(pathname: string): boolean {
  return matchesRoute(pathname, protectedRoutes);
}

// Check if path is a public route
function isPublicRoute(pathname: string): boolean {
  // Root is always public
  if (pathname === "/") return true;
  // Check public route patterns
  return matchesRoute(pathname, publicRoutes);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") || // Static files (e.g., .css, .js, .ico)
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Get Privy auth token from cookies
  // Privy stores auth state in cookies with prefix "privy-"
  const privyToken = request.cookies.get("privy-token")?.value;
  const isAuthenticated = !!privyToken;

  // If accessing a protected route without authentication, redirect to home
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Allow all other requests to proceed
  // Note: Role-based redirects are handled client-side in the onboarding page
  // because we need to fetch the user profile from Supabase which requires
  // a database connection that's not available in Edge middleware
  return NextResponse.next();
}

export const config = {
  // Match all routes except static files
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
