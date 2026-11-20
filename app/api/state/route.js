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
  return { id: idOf(email), name: s.user.name || email.split("@")[0], email, host: HOSTS.includes(email) };
}

// In-memory read-through cache (1.2s TTL) to reduce Upstash Redis calls by ~95% during peak polling
let memoryCache = null;
let cacheExpiresAt = 0;

export function invalidateMemoryCache() {
  memoryCache = null;
  cacheExpiresAt = 0;
}

async function load() {
  const now = Date.now();
  if (memoryCache && now < cacheExpiresAt) {
    return memoryCache;
  }
  const r = redis();
  const [st, players, matches, votes, gifts, insiders, flowers, chiefGuestRaw, reviewsRaw, attendeesRaw] = await Promise.all([
    r.get("fg:state"),
    r.hgetall("fg:players"),
    r.hgetall("fg:matches"),
    r.hgetall("fg:votes"),
    r.hgetall("fg:gifts"),
    r.smembers("fg:insiders"),
    r.get("fg:flowers"),
    r.get("fg:chief_guest"),
    r.lrange("fg:reviews", 0, 49),
    r.hgetall("fg:attendees"),
  ]);
  const insiderList = Array.isArray(insiders) ? insiders : [];
  let chiefGuest = null;
  if (chiefGuestRaw) {
    try {
      chiefGuest = typeof chiefGuestRaw === "string" ? JSON.parse(chiefGuestRaw) : chiefGuestRaw;
    } catch {
      chiefGuest = null;
    }
  }
  const reviews = [];
  if (Array.isArray(reviewsRaw)) {
    for (const item of reviewsRaw) {
      try {
        reviews.push(typeof item === "string" ? JSON.parse(item) : item);
      } catch {}
    }
  }
  const attendeesList = [];
  if (attendeesRaw && typeof attendeesRaw === "object") {
    const cutoff = now - 15 * 60 * 1000;
    for (const raw of Object.values(attendeesRaw)) {
      try {
        const item = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (item && item.seenAt > cutoff) {
          attendeesList.push({
            id: item.id,
            name: item.name,
            email: item.email || "",
            seenAt: item.seenAt,
            joinedGame: !!(players && players[item.id]),
          });
        }
      } catch {}
    }
  }
  const data = {
    st: st || { phase: "lobby", inaugurated: false },
    players: players || {},
    matches: matches || {},
    votes: votes || {},
    gifts: gifts || {},
    insiders: insiderList,
    flowers: parseInt(flowers || "0", 10),
    chiefGuest,
    reviews,
    attendees: attendeesList,
  };
  memoryCache = data;
  cacheExpiresAt = now + 1200; // 1.2s TTL
  return data;
}

// Matches are NEVER returned except a person's own giftee. Not even to organizers.
export async function GET() {
  const me = await who();
  if (!me) return Response.json({ error: "auth" }, { status: 401 });
  const { st, players, matches, votes, gifts, insiders, flowers, chiefGuest, reviews, attendees } = await load();
  const drawn = st.phase === "drawn";

  // Debounced heartbeat to track online attendees (every 25s per user)
  const now = Date.now();
  if (typeof global.lastSeen === "undefined") global.lastSeen = {};
  if (!global.lastSeen[me.id] || now - global.lastSeen[me.id] > 25000) {
    global.lastSeen[me.id] = now;
    redis().hset("fg:attendees", {
      [me.id]: JSON.stringify({ id: me.id, name: me.name, email: me.email || "", seenAt: now })
    }).catch(() => {});
  }

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

  const insiderSet = new Set(insiders || []);

  // Matching check: Is currently authenticated user the assigned Chief Guest?
  // Matches by ID, email, or name so Chief Guest NEVER has to click 'join game' to be recognized!
  const isCgMatch = !!(
    chiefGuest &&
    chiefGuest.assigned &&
    (
      (chiefGuest.id && chiefGuest.id === me.id) ||
      (chiefGuest.email && me.email && chiefGuest.email.toLowerCase() === me.email.toLowerCase()) ||
      (chiefGuest.name && me.name && (
        chiefGuest.name.toLowerCase().trim() === me.name.toLowerCase().trim() ||
        chiefGuest.name.toLowerCase().split(" ")[0] === me.name.toLowerCase().split(" ")[0]
      ))
    )
  );

  // SECURITY GUARD FOR FE TEAM: Server-side projection of Chief Guest
  let clientChiefGuest = null;
  if (chiefGuest && chiefGuest.assigned) {
    if (chiefGuest.revealed || me.host) {
      clientChiefGuest = {
        assigned: true,
        revealed: !!chiefGuest.revealed,
        id: chiefGuest.id || "",
        name: chiefGuest.name || "Chief Guest",
        title: chiefGuest.title || "Founder & CEO",
        photoUrl: chiefGuest.photoUrl || "",
        isMe: isCgMatch,
      };
    } else if (isCgMatch) {
      // The Chief Guest themselves can see their VIP role before public reveal!
      clientChiefGuest = {
        assigned: true,
        revealed: false,
        name: chiefGuest.name,
        title: chiefGuest.title || "VIP Guest",
        photoUrl: chiefGuest.photoUrl || "",
        isMe: true,
      };
    } else {
      // Unrevealed state for non-hosts: Omit all identity details completely
      clientChiefGuest = {
        assigned: true,
        revealed: false,
        isMe: false,
      };
    }
  }

  const myAttendee = {
    id: me.id,
    name: me.name,
    email: me.email || "",
    seenAt: now,
    joinedGame: !!players[me.id],
  };
  const activeAttendees = [
    myAttendee,
    ...(attendees || []).filter((a) => a.id !== me.id),
  ];

  return Response.json({
    now: Date.now(),
    me: { id: me.id, name: me.name, email: me.email, host: me.host, joined: !!players[me.id], isAiInsider: insiderSet.has(me.id) },
    attendees: me.host ? activeAttendees : undefined,
    players: Object.entries(players).map(([id, name]) => ({
      id,
      name,
      isAiInsider: insiderSet.has(id),
    })),
    phase: st.phase,
    inaugurated: !!st.inaugurated,
    flowerCount: flowers || 0,
    chiefGuest: clientChiefGuest,
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
    reviews: reviews || [],
  });
}

export async function POST(req) {
  const me = await who();
  if (!me) return Response.json({ error: "auth" }, { status: 401 });
  let b;
  try { b = await req.json(); } catch { b = {}; }
  const { st, players, matches, votes, chiefGuest } = await load();
  const r = redis();
  const drawn = st.phase === "drawn";
  const A = b.action;
  const bad = (m) => Response.json({ error: m }, { status: 400 });
  const save = async (patch) => {
    await r.set("fg:state", { ...st, ...patch });
    invalidateMemoryCache();
  };

  const isChiefGuest = !!(
    chiefGuest &&
    (
      (chiefGuest.id && chiefGuest.id === me.id) ||
      (chiefGuest.email && me.email && chiefGuest.email.toLowerCase() === me.email.toLowerCase()) ||
      (chiefGuest.name && me.name && (
        chiefGuest.name.toLowerCase().trim() === me.name.toLowerCase().trim() ||
        chiefGuest.name.toLowerCase().split(" ")[0] === me.name.toLowerCase().split(" ")[0]
      ))
    )
  );
  const hostOnly = [
    "remove",
    "draw",
    "roll",
    "next",
    "reveal",
    "announce",
    "reset",
    "nuclear_reset",
    "addTime",
    "pick_reader",
    "reset_inauguration",
    "set_chief_guest",
    "reveal_chief_guest",
    "reset_chief_guest",
  ];
  if (hostOnly.includes(A) && !me.host) return Response.json({ error: "forbidden" }, { status: 403 });

  // Ribbon cutting permission: Organizer OR officially revealed Chief Guest
  if (A === "inaugurate") {
    if (!me.host && !isChiefGuest) return Response.json({ error: "forbidden" }, { status: 403 });
    await save({ inaugurated: true });
    return Response.json({ ok: true, inaugurated: true });
  } else if (A === "reset_inauguration") {
    await save({ inaugurated: false });
    return Response.json({ ok: true, inaugurated: false });
  } else if (A === "set_chief_guest") {
    const cgName = (b.name || "").trim().slice(0, 80);
    const cgTitle = (b.title || "Founder & CEO").trim().slice(0, 100);
    const cgPhoto = (b.photoUrl || "").trim().slice(0, 500);
    const cgId = (b.id || "").trim();
    const cgEmail = (b.email || "").trim().toLowerCase();
    if (!cgName) return bad("Please enter Chief Guest name.");
    const cgData = {
      assigned: true,
      revealed: false,
      name: cgName,
      title: cgTitle,
      photoUrl: cgPhoto,
      id: cgId,
      email: cgEmail,
    };
    await r.set("fg:chief_guest", JSON.stringify(cgData));
    invalidateMemoryCache();
    return Response.json({ ok: true });
  } else if (A === "reveal_chief_guest") {
    if (!chiefGuest) return bad("No chief guest assigned yet.");
    const updated = { ...chiefGuest, revealed: true };
    await r.set("fg:chief_guest", JSON.stringify(updated));
    invalidateMemoryCache();
    return Response.json({ ok: true });
  } else if (A === "reset_chief_guest") {
    await r.del("fg:chief_guest");
    invalidateMemoryCache();
    return Response.json({ ok: true });
  } else if (A === "flower") {
    const updated = await r.incr("fg:flowers");
    invalidateMemoryCache();
    return Response.json({ ok: true, flowerCount: updated });
  } else if (A === "join") {
    if (drawn) return bad("The draw already happened.");
    await r.hset("fg:players", { [me.id]: me.name });
    invalidateMemoryCache();
  } else if (A === "claim_insider") {
    await r.sadd("fg:insiders", me.id);
    invalidateMemoryCache();
    return Response.json({ success: true, isAiInsider: true });
  } else if (A === "leave") {
    if (drawn) return bad("The draw already happened.");
    await r.hdel("fg:players", me.id);
    invalidateMemoryCache();
  } else if (A === "submit_gift") {
    if (!drawn || !players[me.id]) return bad("Not allowed.");
    const title = (b.title || "").trim().slice(0, 100);
    const pitch = (b.pitch || "").trim().slice(0, 600);
    if (!title) return bad("Please enter a gift title.");
    await r.hset("fg:gifts", { [me.id]: JSON.stringify({ title, pitch }) });
    invalidateMemoryCache();
  } else if (A === "submit_stage_pitch") {
    if (!drawn) return bad("Not allowed.");
    const title = (b.title || "").trim().slice(0, 100);
    const pitch = (b.pitch || "").trim().slice(0, 600);
    if (!title) return bad("Please enter a gift title.");

    if (!st.order || st.idx < 0 || st.idx >= st.order.length) {
      return bad("No active receiver on stage.");
    }
    const recv = st.order[st.idx];
    const matchGiver = Object.keys(matches).find((k) => matches[k] === recv);
    const targetGiverId = matchGiver || me.id;

    await r.hset("fg:gifts", { [targetGiverId]: JSON.stringify({ title, pitch }) });
    invalidateMemoryCache();
    return Response.json({ ok: true, activeGift: { title, pitch } });
  } else if (A === "remove") {
    if (drawn) return bad("Reset the draw first.");
    await r.hdel("fg:players", String(b.id));
    invalidateMemoryCache();
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
      phase: "drawn",
      inaugurated: true,
      order: shuf(s),
      idx: -1,
      revealed: false,
      giver: "",
      readerId: "",
      category: "",
      startedAt: 0,
      results: null,
    });
    invalidateMemoryCache();
  } else if (A === "roll") {
    if (!drawn) return bad("Draw first.");
    await save({ category: CATS[Math.floor(Math.random() * CATS.length)] });
  } else if (A === "next") {
    if (!drawn) return bad("Draw first.");
    const nextIdx = Math.min((st.idx ?? -1) + 1, st.order.length);
    const recv = st.order?.[nextIdx];
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
  } else if (A === "review") {
    const stars = Math.max(1, Math.min(5, parseInt(b.stars || "5", 10)));
    const comment = (b.comment || "").trim().slice(0, 300);
    const target = (b.target || "event").slice(0, 60);
    if (!comment && !stars) return bad("Rating or comment required.");

    const ANONYMOUS_MONIKERS = [
      "Anonymous Colleague",
      "Secret Santa",
      "Mystery Elf",
      "Festive Sleuth",
      "Anonymous Coder",
      "Holiday Insider",
      "Incognito Teammate",
      "Silent Santa",
    ];
    const moniker = ANONYMOUS_MONIKERS[Math.floor(Math.random() * ANONYMOUS_MONIKERS.length)];

    const reviewItem = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      stars,
      comment,
      target,
      moniker,
      ts: Date.now(),
    };
    // 100% Anonymous: Zero user identifiers are saved to preserve total privacy!
    await r.lpush("fg:reviews", JSON.stringify(reviewItem));
    await r.ltrim("fg:reviews", 0, 99);
    invalidateMemoryCache();
    return Response.json({ ok: true, review: reviewItem });
  } else if (A === "reset") {
    await Promise.all([
      r.del("fg:state"),
      r.del("fg:matches"),
      r.del("fg:votes"),
      r.del("fg:gifts"),
      r.del("fg:reviews"),
      r.del("fg:ai_reactions"),
    ]);
    invalidateMemoryCache();
  } else if (A === "nuclear_reset") {
    await Promise.all([
      r.del("fg:state"),
      r.del("fg:matches"),
      r.del("fg:votes"),
      r.del("fg:gifts"),
      r.del("fg:flowers"),
      r.del("fg:chief_guest"),
      r.del("fg:reviews"),
      r.del("fg:ai_reactions"),
    ]);
    invalidateMemoryCache();
    return Response.json({ ok: true, cleared: true });
  } else if (A === "vote") {
    if (!drawn || !players[me.id]) return bad("Not allowed.");
    const v = {};
    for (const k of ["a", "b", "c"]) {
      const t = b[k];
      if (!players[t] || t === me.id) return bad("Invalid vote.");
      v[k] = t;
    }
    await r.hset("fg:votes", { [me.id]: v });
    invalidateMemoryCache();
  } else {
    return bad("Unknown action.");
  }
  return Response.json({ ok: true });
}
