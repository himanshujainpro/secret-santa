import { redis } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const r = redis();
    const [st, flowers, players] = await Promise.all([
      r.get("fg:state"),
      r.get("fg:flowers"),
      r.hgetall("fg:players"),
    ]);
    return Response.json({
      st,
      flowers,
      players,
      hostsConfig: (process.env.ORGANIZER_EMAILS || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean),
      allowedDomain: process.env.ALLOWED_DOMAIN || "",
    });
  } catch (e) {
    return Response.json({ error: e.message });
  }
}
