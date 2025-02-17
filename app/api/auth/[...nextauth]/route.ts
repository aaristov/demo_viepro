import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { nocodbFetch } from "@/lib/api";

const TABLE_ID = 'mxusip10ck64oiu';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Search for user in NocoDB - adding URL encoding for safety
          const query = `(email,eq,${credentials.email})`;
          console.log('Attempting to fetch user with query:', query);
          
          const response = await nocodbFetch(
            `/api/v2/tables/${TABLE_ID}/records?where=${query}`
          );
          
          const data = await response.json();
          console.log('NocoDB response:', data);
          
          if (data.list && data.list.length > 0) {
            const user = data.list[0];
            
            if (user.password === credentials.password) {
              return {
                id: user.Id.toString(),
                name: user.name,
                email: user.email,
                role: user.role
              };
            }
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true, // Enable debug messages
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };