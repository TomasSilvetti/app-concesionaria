import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "604800", 10), // 7 días por defecto
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("CREDENTIALS_REQUIRED");
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username as string,
          },
          include: {
            Client: true,
          },
        });

        if (!user) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("INVALID_CREDENTIALS");
        }

        if (!user.activo) {
          throw new Error("ACCOUNT_INACTIVE");
        }

        return {
          id: user.id,
          username: user.username,
          nombre: user.nombre,
          rol: user.rol,
          clienteId: user.clienteId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.nombre = user.nombre;
        token.rol = user.rol;
        token.clienteId = user.clienteId;
      }
      if (token.clienteId === undefined && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { clienteId: true },
        });
        if (dbUser) {
          token.clienteId = dbUser.clienteId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any) = {
          id: token.id as string,
          username: token.username as string,
          nombre: token.nombre as string | null,
          rol: token.rol as string,
          clienteId: token.clienteId as string | null,
        };
      }
      return session;
    },
  },
});
