import GoogleProvider from "next-auth/providers/google";
import { createHash } from "crypto";

const domain = (process.env.ALLOWED_DOMAIN || "").trim().toLowerCase();

// Short stable id so emails are never sent to other players
export const idOf = (email) =>
  createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 10);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "select_account", hd: domain || undefined } },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  callbacks: {
    // Server-side check: only verified emails from your company domain
    async signIn({ profile }) {
      if (!domain || !profile?.email || !profile.email_verified) return false;
      return profile.email.toLowerCase().endsWith("@" + domain);
    },
  },
};
