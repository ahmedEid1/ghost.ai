import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

function toPublicRoutePatterns(raw: string | undefined): string[] {
  if (!raw) return []
  const path = raw.startsWith('/') ? raw.replace(/[?#].*$/, '') : null
  if (!path) return []
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return [path, `${escaped}(.*)`]
}

const isPublicRoute = createRouteMatcher([
  ...toPublicRoutePatterns(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL),
  ...toPublicRoutePatterns(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL),
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
