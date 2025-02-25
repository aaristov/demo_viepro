import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const path = req.nextUrl.pathname;
      
      // Public paths that don't require authentication
      if (path === '/' || // Landing page
          path.startsWith('/auth/') ||
          path.startsWith('/logo.svg') || // Allow access to logo
          path.startsWith('/public/')) {   // Allow access to public assets
        return true;
      }
      
      // Protected paths require a valid token
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - / (landing page)
     * - auth/signin (authentication page)
     * - api/auth (NextAuth.js endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!$|auth/signin|api/auth|_next/static|_next/image|favicon.ico|logo.svg).*)",
  ],
};