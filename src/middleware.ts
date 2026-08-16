import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple cookie-based middleware - no NextAuth dependency
// Session is managed client-side via localStorage + a simple cookie flag

export default function middleware(req: NextRequest) {
  // Let everything through - auth is handled client-side in each page
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
