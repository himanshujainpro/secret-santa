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
    return Response.json({ st, flowers, players });
  } catch (e) {
    return Response.json({ error: e.message });
  }
}
