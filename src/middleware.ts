import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = [
  '/dashboard',
  '/projects/upload',
  '/similarity',
  '/recommendations',
  '/innovation',
  '/collaborations',
  '/saved',
  '/notifications',
  '/profile',
  '/faculty',
  '/institution',
  '/admin',
]

const authRoutes = ['/login', '/register']

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && authRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && protectedRoutes.some(r => pathname.startsWith(r))) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access control
  if (isLoggedIn && req.auth?.user) {
    const role = req.auth.user.role
    
    if (pathname.startsWith('/faculty') && role !== 'FACULTY' && role !== 'PLATFORM_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (pathname.startsWith('/institution') && role !== 'INSTITUTION_ADMIN' && role !== 'PLATFORM_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (pathname.startsWith('/admin') && role !== 'PLATFORM_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
