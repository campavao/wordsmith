import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import GoogleProvider from "next-auth/providers/google";
import { cert } from "firebase-admin/app";
import { authOptions } from "../../auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"];
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
