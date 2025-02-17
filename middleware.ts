import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Add your custom authorization logic here
      const path = req.nextUrl.pathname;
      
      // Public paths
      if (path.startsWith('/auth/')) {
        return true;
      }
      
      // Protected paths
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - auth/signin (authentication page)
     * - api/auth (NextAuth.js endpoints)
     * - _next/static (static files)
     * - favicon.ico (favicon file)
     */
    "/((?!auth/signin|api/auth|_next/static|favicon.ico).*)",
  ],
};