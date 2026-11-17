"use client";
import { useEffect, useState, useCallback } from "react";
import { signIn, signOut } from "next-auth/react";

const PITCH = 90;

export default function Home() {
  const [d, setD] = useState(null);
  const [auth, setAuth] = useState(true);
  const [skew, setSkew] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [show, setShow] = useState(false);
  const [v, setV] = useState({});
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/state", { cache: "no-store" });
      if (r.status === 401) { setAuth(false); return; }
      const j = await r.json();
      setAuth(true); setSkew(j.now - Date.now()); setD(j);
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const a = setInterval(load, 2000);
    const b = setInterval(() => setNow(Date.now()), 500);
    return () => { clearInterval(a); clearInterval(b); };
  }, [load]);

  const act = async (action, extra = {}) => {
    setMsg("");
    const r = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const j = await r.json();
    if (!r.ok) setMsg(j.error || "Something went wrong");
    load();
  };

  if (!auth)
    return (
      <main>
        <h1>🎁 Virtual Secret Santa</h1>
        <p className="mut">Sign in with your Google account to play.</p>
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      </main>
    );
  if (!d) return <main><p className="mut">Loading…</p></main>;

  const nm = (id) => d.players.find((p) => p.id === id)?.name || "Someone";
  const drawn = d.phase === "drawn";
  const me = d.me;
  const i = d.idx, n = d.order.length;
  const left = Math.ceil(PITCH - (now + skew - d.startedAt) / 1000);
  const opts = d.players.filter((p) => p.id !== me.id);
  const pick = (k) => v[k] || d.myVotes?.[k] || opts[0]?.id || "";
  const recv = d.order[i];

  return (
    <main>
      <h1>🎁 Virtual Secret Santa</h1>
      <p className="mut">Fun Friday · pitch a gift live, no prep, no AI. <a href="#" onClick={(e) => { e.preventDefault(); signOut(); }}>Sign out</a></p>
      {msg && <p className="err">{msg}</p>}

      {!me.joined && !drawn && (
        <div className="card">
          <h2>Join the game</h2>
          <p className="mut">You’ll join as {me.name}</p>
          <button onClick={() => act("join")}>Join as me</button>
        </div>
      )}
      {drawn && !me.joined && <div className="card mut">The draw already happened and you weren’t in the lobby.</div>}

      {drawn && me.joined && d.myMatch && (
        <div className="card">
          <h2>Your giftee</h2>
          <div className="reveal" onClick={() => setShow(!show)}>
            {show ? (<><div className="mut">You’re gifting to</div><div className="big">{nm(d.myMatch)}</div><div className="mut">Use something real: inside jokes, habits, things only they would relate to.</div></>) : "👀 Tap to reveal (make sure nobody is watching)"}
          </div>
        </div>
      )}

      {drawn && (
        <div className="card">
          {i < 0 && (<><h2>Stage</h2><span className="mut">Pitches haven’t started. Prep your gift idea!</span></>)}
          {i >= n && n > 0 && (<><h2>Stage</h2><div className="big">That’s a wrap 🎉</div><span className="mut">Cast your award votes below.</span></>)}
          {i >= 0 && i < n && (
            <>
              <h2>Pitch {i + 1} of {n}</h2>
              <div className="mut">A gift for</div>
              <div className="big">{nm(recv)}</div>
              {d.category && <div className="chip">🎲 {d.category}</div>}
              <div className="tm">{left > 0 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : "Time’s up! ⏰"}</div>
              <div>{d.revealed ? <>Giver: <b>{nm(d.giver)}</b> 🎁</> : <>Giver: ??? <span className="mut">Receiver, take your guess!</span></>}</div>
            </>
          )}
        </div>
      )}

      {me.host && (
        <div className="card">
          <h2>Organizer</h2>
          {!drawn ? (
            <>
              <button onClick={() => act("draw")} disabled={d.players.length < 3}>🎲 Draw matches</button>
              <div className="mut">Needs at least 3 people. Draw once everyone has joined.</div>
            </>
          ) : (
            <>
              <button onClick={() => act("roll")}>🎲 Roll category</button>
              <button onClick={() => act("next")} disabled={i >= n}>▶ {i < 0 ? "Start pitches" : "Next pitch"}</button>
              <button className="alt" onClick={() => act("reveal")} disabled={i < 0 || i >= n || d.revealed}>Reveal giver</button>
              <button className="alt" onClick={() => act("announce")}>🏆 Announce winners</button>
              <button className="alt" onClick={() => confirm("Reset the draw?") && act("reset")}>Reset draw</button>
            </>
          )}
        </div>
      )}

      <div className="card">
        <h2>Who’s in ({d.players.length})</h2>
        <div className="chips">
          {d.players.length === 0 && <span className="mut">Nobody yet. Share the link!</span>}
          {d.players.map((p) => (
            <span className="chip" key={p.id}>
              {p.name}{p.id === me.id ? " (you)" : ""}
              {me.host && !drawn && <button title="Remove" onClick={() => act("remove", { id: p.id })}>✕</button>}
            </span>
          ))}
        </div>
      </div>

      {drawn && me.joined && (
        <div className="card">
          <h2>Awards</h2>
          {[["a", "Most thoughtful"], ["b", "Most ridiculous"], ["c", "Best pitch"]].map(([k, label]) => (
            <div key={k}>
              <label>{label}</label>
              <select value={pick(k)} onChange={(e) => setV({ ...v, [k]: e.target.value })}>
                {opts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => act("vote", { a: pick("a"), b: pick("b"), c: pick("c") })}>Submit votes</button>
          <div className="mut">
            {d.results
              ? <p>🏆 Thoughtful: <b>{nm(d.results.a)}</b><br />Ridiculous: <b>{nm(d.results.b)}</b><br />Best pitch: <b>{nm(d.results.c)}</b></p>
              : me.host ? <p>Votes in: {d.votesIn}/{d.players.length}</p> : <p>The organizer will announce the winners.</p>}
          </div>
        </div>
      )}
    </main>
  );
}
