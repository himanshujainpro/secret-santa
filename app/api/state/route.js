import { getServerSession } from "next-auth";
import { authOptions, idOf } from "@/lib/auth";
import { redis } from "@/lib/db";

export const dynamic = "force-dynamic";

const CATS = [
  "Useless but hilarious",
  "Something for your desk",
  "A gift for their 2030 self",
  "A gift from your home city",
  "Something they’d never buy themselves",
  "A gift that solves a Monday problem",
  "The most dramatic gift ever",
  "A gift that fits their personality",
];
const HOSTS = (process.env.ORGANIZER_EMAILS || "")
  .toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);

const shuf = (a) => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

async function who() {
  const s = await getServerSession(authOptions);
  const email = s?.user?.email?.toLowerCase();
  if (!email) return null;
  return { id: idOf(email), name: s.user.name || email.split("@")[0], host: HOSTS.includes(email) };
}

async function load() {
  const r = redis();
  const [st, players, matches, votes] = await Promise.all([
    r.get("fg:state"), r.hgetall("fg:players"), r.hgetall("fg:matches"), r.hgetall("fg:votes"),
  ]);
  return { st: st || { phase: "lobby" }, players: players || {}, matches: matches || {}, votes: votes || {} };
}

// Matches are NEVER returned except a person's own giftee. Not even to organizers.
export async function GET() {
  const me = await who();
  if (!me) return Response.json({ error: "auth" }, { status: 401 });
  const { st, players, matches, votes } = await load();
  const drawn = st.phase === "drawn";
  return Response.json({
    now: Date.now(),
    me: { id: me.id, name: me.name, host: me.host, joined: !!players[me.id] },
    players: Object.entries(players).map(([id, name]) => ({ id, name })),
    phase: st.phase,
    order: st.order || [],
    idx: st.idx ?? -1,
    revealed: !!st.revealed,
    giver: st.revealed ? st.giver : "",
    category: st.category || "",
    startedAt: st.startedAt || 0,
    results: st.results || null,
    myMatch: drawn && players[me.id] ? matches[me.id] || "" : "",
    myVotes: votes[me.id] || null,
    votesIn: me.host ? Object.keys(votes).length : null,
  });
}

export async function POST(req) {
  const me = await who();
  if (!me) return Response.json({ error: "auth" }, { status: 401 });
  let b;
  try { b = await req.json(); } catch { b = {}; }
  const { st, players, matches, votes } = await load();
  const r = redis();
  const drawn = st.phase === "drawn";
  const A = b.action;
  const bad = (m) => Response.json({ error: m }, { status: 400 });
  const save = (patch) => r.set("fg:state", { ...st, ...patch });

  const hostOnly = ["remove", "draw", "roll", "next", "reveal", "announce", "reset"];
  if (hostOnly.includes(A) && !me.host) return Response.json({ error: "forbidden" }, { status: 403 });

  if (A === "join") {
    if (drawn) return bad("The draw already happened.");
    await r.hset("fg:players", { [me.id]: me.name });
  } else if (A === "remove") {
    if (drawn) return bad("Reset the draw first.");
    await r.hdel("fg:players", String(b.id));
  } else if (A === "draw") {
    const ids = Object.keys(players);
    if (drawn || ids.length < 3) return bad("Need 3+ players and no existing draw.");
    const s = shuf(ids);
    const m = {};
    s.forEach((g, i) => (m[g] = s[(i + 1) % s.length]));
    await r.del("fg:matches");
    await r.hset("fg:matches", m);
    await r.set("fg:state", {
      phase: "drawn", order: shuf(s), idx: -1, revealed: false,
      giver: "", category: "", startedAt: 0, results: null,
    });
  } else if (A === "roll") {
    if (!drawn) return bad("Draw first.");
    await save({ category: CATS[Math.floor(Math.random() * CATS.length)] });
  } else if (A === "next") {
    if (!drawn) return bad("Draw first.");
    await save({ idx: Math.min((st.idx ?? -1) + 1, st.order.length), revealed: false, giver: "", startedAt: Date.now() });
  } else if (A === "reveal") {
    const recv = st.order?.[st.idx];
    if (!drawn || !recv) return bad("No active pitch.");
    const giver = Object.keys(matches).find((k) => matches[k] === recv) || "";
    await save({ revealed: true, giver });
  } else if (A === "announce") {
    const top = (f) => {
      const c = {};
      Object.values(votes).forEach((v) => { if (v[f]) c[v[f]] = (c[v[f]] || 0) + 1; });
      const t = Object.entries(c).sort((x, y) => y[1] - x[1])[0];
      return t ? t[0] : "";
    };
    await save({ results: { a: top("a"), b: top("b"), c: top("c") } });
  } else if (A === "reset") {
    await Promise.all([r.del("fg:state"), r.del("fg:matches"), r.del("fg:votes")]);
  } else if (A === "vote") {
    if (!drawn || !players[me.id]) return bad("Not allowed.");
    const v = {};
    for (const k of ["a", "b", "c"]) {
      const t = b[k];
      if (!players[t] || t === me.id) return bad("Invalid vote.");
      v[k] = t;
    }
    await r.hset("fg:votes", { [me.id]: v });
  } else {
    return bad("Unknown action.");
  }
  return Response.json({ ok: true });
}
