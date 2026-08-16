import { NextResponse } from 'next/server'

// NextAuth disabled - using client-side localStorage auth
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}

export async function POST() {
  return NextResponse.json({ status: 'ok' })
}
