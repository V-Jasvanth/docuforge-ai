import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "developer@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Foundation authorization logic
        // In real database execution, this queries `prisma.user` and checks bcrypt password
        if (credentials.email === "demo@docuforge.ai" && credentials.password === "password123") {
          return {
            id: "user-demo-123",
            name: "Alex Vance",
            email: "demo@docuforge.ai",
            image: "https://avatar.vercel.sh/alex",
          };
        }

        return {
          id: "user-1",
          name: credentials.email.split("@")[0],
          email: credentials.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  secret: process.env.AUTH_SECRET || "docuforge_development_secret_key_32_characters_minimum",
};
