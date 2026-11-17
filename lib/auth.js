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
      authorization: {
        params: {
          prompt: "select_account",
          ...(domain && domain !== "gmail.com" && domain !== "*" ? { hd: domain } : {}),
        },
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  callbacks: {
    // Allows any verified Google account if ALLOWED_DOMAIN is empty or "*",
    // or restricts to domain if specified (e.g. gmail.com or company domain)
    async signIn({ profile }) {
      if (!profile?.email || !profile.email_verified) return false;
      if (domain && domain !== "*" && domain !== "all") {
        return profile.email.toLowerCase().endsWith("@" + domain);
      }
      return true;
    },
  },
};
