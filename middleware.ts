import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Protect all routes except login, signup, static files, and NextAuth API
    "/((?!login|signup|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}