import { getServerSession } from "next-auth";
import { authOptions, idOf } from "@/lib/auth";
import { redis } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const r = redis();
  try {
    const raw = await r.hgetall("fg:ai_reactions");
    const counts = {
      blown: parseInt(raw?.blown || "42", 10),
      speed: parseInt(raw?.speed || "38", 10),
      banter: parseInt(raw?.banter || "56", 10),
      op: parseInt(raw?.op || "64", 10),
    };
    return Response.json({ counts, success: true });
  } catch (err) {
    return Response.json({
      counts: { blown: 42, speed: 38, banter: 56, op: 64 },
      success: true,
    });
  }
}

export async function POST(req) {
  const r = redis();
  let body = {};
  try {
    body = await req.json();
  } catch {}

  const s = await getServerSession(authOptions);
  const email = s?.user?.email?.toLowerCase();
  const userId = email ? idOf(email) : null;

  try {
    if (body.action === "claim_badge") {
      if (userId) {
        await r.sadd("fg:insiders", userId);
      }
      return Response.json({ success: true, claimed: true });
    }

    if (body.type && ["blown", "speed", "banter", "op"].includes(body.type)) {
      const updated = await r.hincrby("fg:ai_reactions", body.type, 1);
      return Response.json({ success: true, updated });
    }
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
