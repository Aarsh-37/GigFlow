import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Auth and Supabase completely disabled during UI reconstruction Phase 7
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
