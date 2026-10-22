import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/dashboard', '/documents', '/study', '/research', '/flashcards', '/quizzes', '/account']
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']

function matches(route: string, path: string) {
  return path === route || path.startsWith(`${route}/`)
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((r) => matches(r, path))
  const isPublicRoute = publicRoutes.some((r) => matches(r, path))

  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie)

  // Sessions without a valid sessionVersion are treated as logged out here.
  // verifySession (dal.ts) does the authoritative check and clears stale
  // cookies, so these two redirects can never form a loop.
  const authed =
    session?.userId !== undefined &&
    typeof session.sessionVersion === 'number'

  if (isProtectedRoute && !authed) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublicRoute && authed) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
