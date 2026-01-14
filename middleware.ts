

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Not logged in → redirect to /login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Only ADMINs can access dashboard
    if (pathname.startsWith("/dashboard") && token.loginAs !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // If already logged in and trying to access /login → redirect to proper place
    if (pathname.startsWith("/login")) {
      if (token.loginAs === "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

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
    // Protect all routes except login, register, and NextAuth API
    "/((?!login|register|api/auth).*)",
  ],
}