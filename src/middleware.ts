import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { checkAdminAccess } from "@/lib/admin-utils";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/user-profile(.*)'])
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/test-(.*)', // Protect all test routes
  '/api/admin(.*)' // Protect admin API routes
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
  
  if (isAdminRoute(req)) {
    await auth.protect()
    
    const { userId } = await auth()
    const isAdmin = await checkAdminAccess(userId)
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
}) // set debug to true to see the middleware in action



export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}; 