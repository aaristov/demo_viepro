import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { nocodbFetch } from "@/lib/api";
import { compare } from "bcryptjs";
import { JWT } from "next-auth/jwt";

const TABLE_ID = process.env.NOCODB_PATIENTS_TABLE_ID as string;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const encodedEmail = encodeURIComponent(credentials.email.toLowerCase());
          const query = `(email,eq,${encodedEmail})`;
          
          const response = await nocodbFetch(
            `/api/v2/tables/${TABLE_ID}/records?where=${query}`
          );
          
          const data = await response.json();
          
          if (data.list && data.list.length > 0) {
            const user = data.list[0];
            const storedHashedPassword = Buffer.from(user.password, 'base64').toString();
            const isValid = await compare(credentials.password, storedHashedPassword);
            
            if (isValid) {
              return {
                id: user.Id?.toString() || user.id?.toString(),
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };