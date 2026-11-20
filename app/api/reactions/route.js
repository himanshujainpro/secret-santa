import { getServerSession } from "next-auth";
import { authOptions, idOf } from "@/lib/auth";
import { redis } from "@/lib/db";

export const dynamic = "force-dynamic";

let reactionsCache = null;
let reactionsExpiresAt = 0;

export async function GET() {
  const now = Date.now();
  if (reactionsCache && now < reactionsExpiresAt) {
    return Response.json(reactionsCache);
  }

  const r = redis();
  try {
    const raw = await r.hgetall("fg:ai_reactions");
    const counts = {
      blown: parseInt(raw?.blown || "0", 10),
      speed: parseInt(raw?.speed || "0", 10),
      banter: parseInt(raw?.banter || "0", 10),
      op: parseInt(raw?.op || "0", 10),
    };
    reactionsCache = { counts, success: true };
    reactionsExpiresAt = now + 1500;
    return Response.json(reactionsCache);
  } catch (err) {
    return Response.json({
      counts: { blown: 0, speed: 0, banter: 0, op: 0 },
      success: true,
    });
  }
}

export async function POST(req) {
  reactionsCache = null;
  reactionsExpiresAt = 0;
  const r = redis();
  let body = {};
  try {
    body = await req.json();
  } catch {}

  const s = await getServerSession(authOptions);
  const email = s?.user?.email?.toLowerCase();
  const userId = email ? idOf(email) : null;

  try {
    if (body.action === "reset_reactions") {
      await r.del("fg:ai_reactions");
      return Response.json({
        success: true,
        cleared: true,
        counts: { blown: 0, speed: 0, banter: 0, op: 0 },
      });
    }

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
