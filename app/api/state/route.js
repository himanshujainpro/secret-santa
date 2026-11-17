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
  const [st, players, matches, votes, gifts] = await Promise.all([
    r.get("fg:state"),
    r.hgetall("fg:players"),
    r.hgetall("fg:matches"),
    r.hgetall("fg:votes"),
    r.hgetall("fg:gifts"),
  ]);
  return {
    st: st || { phase: "lobby" },
    players: players || {},
    matches: matches || {},
    votes: votes || {},
    gifts: gifts || {},
  };
}

// Matches are NEVER returned except a person's own giftee. Not even to organizers.
export async function GET() {
  const me = await who();
  if (!me) return Response.json({ error: "auth" }, { status: 401 });
  const { st, players, matches, votes, gifts } = await load();
  const drawn = st.phase === "drawn";

  // Active gift on the live stage (anonymous - author ID is never attached)
  let activeGift = null;
  if (drawn && st.order && st.idx >= 0 && st.idx < st.order.length) {
    const recv = st.order[st.idx];
    const giverId = Object.keys(matches).find((k) => matches[k] === recv);
    if (giverId && gifts[giverId]) {
      try {
        activeGift = typeof gifts[giverId] === "string" ? JSON.parse(gifts[giverId]) : gifts[giverId];
      } catch {
        activeGift = null;
      }
    }
  }

  // The gift the currently logged-in user submitted for their own giftee
  let myGift = null;
  if (drawn && players[me.id] && gifts[me.id]) {
    try {
      myGift = typeof gifts[me.id] === "string" ? JSON.parse(gifts[me.id]) : gifts[me.id];
    } catch {
      myGift = null;
    }
  }

  return Response.json({
    now: Date.now(),
    me: { id: me.id, name: me.name, host: me.host, joined: !!players[me.id] },
    players: Object.entries(players).map(([id, name]) => ({ id, name })),
    phase: st.phase,
    order: st.order || [],
    idx: st.idx ?? -1,
    revealed: !!st.revealed,
    giver: st.revealed ? st.giver : "",
    readerId: st.readerId || "",
    category: st.category || "",
    startedAt: st.startedAt || 0,
    results: st.results || null,
    myMatch: drawn && players[me.id] ? matches[me.id] || "" : "",
    myGift,
    activeGift,
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

  const hostOnly = ["remove", "draw", "roll", "next", "reveal", "announce", "reset", "addTime", "pick_reader"];
  if (hostOnly.includes(A) && !me.host) return Response.json({ error: "forbidden" }, { status: 403 });

  if (A === "join") {
    if (drawn) return bad("The draw already happened.");
    await r.hset("fg:players", { [me.id]: me.name });
  } else if (A === "leave") {
    if (drawn) return bad("The draw already happened.");
    await r.hdel("fg:players", me.id);
  } else if (A === "submit_gift") {
    if (!drawn || !players[me.id]) return bad("Not allowed.");
    const title = (b.title || "").trim().slice(0, 100);
    const pitch = (b.pitch || "").trim().slice(0, 600);
    if (!title) return bad("Please enter a gift title.");
    await r.hset("fg:gifts", { [me.id]: JSON.stringify({ title, pitch }) });
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
    await r.del("fg:gifts");
    await r.hset("fg:matches", m);
    await r.set("fg:state", {
      phase: "drawn", order: shuf(s), idx: -1, revealed: false,
      giver: "", readerId: "", category: "", startedAt: 0, results: null,
    });
  } else if (A === "roll") {
    if (!drawn) return bad("Draw first.");
    await save({ category: CATS[Math.floor(Math.random() * CATS.length)] });
  } else if (A === "next") {
    if (!drawn) return bad("Draw first.");
    const nextIdx = Math.min((st.idx ?? -1) + 1, st.order.length);
    const recv = st.order?.[nextIdx];
    // Pick a random colleague to present/read the pitch aloud (anyone except the receiver)
    const playerIds = Object.keys(players);
    const eligibleReaders = playerIds.filter((id) => id !== recv);
    const readerId = eligibleReaders.length > 0 ? eligibleReaders[Math.floor(Math.random() * eligibleReaders.length)] : "";
    await save({
      idx: nextIdx,
      revealed: false,
      giver: "",
      readerId: readerId || "",
      startedAt: Date.now(),
    });
  } else if (A === "pick_reader") {
    const recv = st.order?.[st.idx];
    if (!drawn || !recv) return bad("No active pitch.");
    const playerIds = Object.keys(players);
    const eligibleReaders = playerIds.filter((id) => id !== recv && id !== st.readerId);
    const pool = eligibleReaders.length > 0 ? eligibleReaders : playerIds.filter((id) => id !== recv);
    const readerId = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : "";
    await save({ readerId });
  } else if (A === "addTime") {
    if (!drawn || !st.startedAt) return bad("No active pitch.");
    await save({ startedAt: (st.startedAt || Date.now()) + 30000 });
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
    await Promise.all([r.del("fg:state"), r.del("fg:matches"), r.del("fg:votes"), r.del("fg:gifts")]);
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
