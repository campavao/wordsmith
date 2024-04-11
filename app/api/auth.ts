import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import { cert } from "firebase-admin/app";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID ?? "",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
      privateKey: process.env.FIREBASE_PRIVATE_KEY ?? "",
    }),
  }),
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    signOut: "/signout",
  },
};
