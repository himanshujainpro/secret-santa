"use client";
import { useEffect, useState, useCallback } from "react";
import { signIn, signOut } from "next-auth/react";

const PITCH_DURATION = 90;

function ScansLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img
        src="/scans-logo.svg"
        alt="Scans.ai"
        style={{ height: "24px", width: "auto" }}
      />
    </div>
  );
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Home() {
  const [d, setD] = useState(null);
  const [auth, setAuth] = useState(true);
  const [skew, setSkew] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [showGiftee, setShowGiftee] = useState(false);
  const [votes, setVotes] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [isActing, setIsActing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/state", { cache: "no-store" });
      if (r.status === 401) {
        setAuth(false);
        return;
      }
      const j = await r.json();
      setAuth(true);
      setSkew(j.now - Date.now());
      setD(j);
    } catch {
      // keep previous state on transient network blip
    }
  }, []);

  useEffect(() => {
    load();
    const pollInterval = setInterval(load, 2000);
    const clockInterval = setInterval(() => setNow(Date.now()), 500);
    return () => {
      clearInterval(pollInterval);
      clearInterval(clockInterval);
    };
  }, [load]);

  const act = async (action, extra = {}) => {
    setErrorMsg("");
    setIsActing(true);
    try {
      const r = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const j = await r.json();
      if (!r.ok) {
        setErrorMsg(j.error || "Action failed");
      }
      await load();
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsActing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. Unauthenticated View (Login)
  // ---------------------------------------------------------------------------
  if (!auth) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header className="app-header">
          <div className="header-container">
            <div className="logo-badge-wrap">
              <ScansLogo />
              <span className="event-badge">Fun Friday</span>
            </div>
          </div>
        </header>

        <main className="container" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="card hero-box">
            <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "16px" }}>
              <span className="event-badge">🎁 Holiday Edition</span>
            </div>
            <h1 className="hero-title">Virtual Secret Santa</h1>
            <p className="hero-subtitle">
              Live gifting, zero prep, 90 seconds on the clock, and hilarious pitch reveals.
            </p>

            <button
              onClick={() => signIn("google")}
              className="btn btn-black btn-lg"
              style={{ width: "100%", maxWidth: "340px", margin: "0 auto" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <div className="flow-steps">
              <div className="step-card">
                <div className="step-number">Step 01</div>
                <div className="step-title">Join Lobby</div>
                <div className="step-desc">Sign in with your Google account and enter the room.</div>
              </div>
              <div className="step-card">
                <div className="step-number">Step 02</div>
                <div className="step-title">Secret Draw</div>
                <div className="step-desc">Your giftee is private and locked only to your screen.</div>
              </div>
              <div className="step-card">
                <div className="step-number">Step 03</div>
                <div className="step-title">Pitch & Guess</div>
                <div className="step-desc">90-second live pitch, receiver guesses, and award voting!</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Loading State
  // ---------------------------------------------------------------------------
  if (!d) {
    return (
      <main className="container" style={{ textAlign: "center", paddingTop: "120px" }}>
        <div style={{ display: "inline-block", marginBottom: "16px" }}>
          <ScansLogo />
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Loading game session…</p>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Authenticated Game View
  // ---------------------------------------------------------------------------
  const { me, phase, order, idx, category, startedAt, results, myMatch, myVotes, votesIn } = d;
  const drawn = phase === "drawn";
  const nameOf = (id) => d.players.find((p) => p.id === id)?.name || "Colleague";
  const currentReceiverId = order[idx];
  const totalPitches = order.length;
  const isPitching = idx >= 0 && idx < totalPitches;
  const isPitchFinished = idx >= totalPitches && totalPitches > 0;

  // Timer math
  const elapsedSeconds = (now + skew - startedAt) / 1000;
  const timeLeft = Math.max(0, Math.ceil(PITCH_DURATION - elapsedSeconds));
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / PITCH_DURATION) * 100));

  // Eligible players for awards (everyone except yourself)
  const awardCandidates = d.players.filter((p) => p.id !== me.id);
  const getSelectedVote = (key) => votes[key] || myVotes?.[key] || awardCandidates[0]?.id || "";

  return (
    <div>
      {/* Sleek Top Navbar */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-badge-wrap">
            <ScansLogo />
            <span className="event-badge">Secret Santa</span>
          </div>
          <div className="header-user">
            <div className="user-pill">
              <span className="user-avatar-circle">{getInitials(me.name)}</span>
              <span>{me.name}</span>
            </div>
            <a
              href="#"
              className="signout-link"
              onClick={(e) => {
                e.preventDefault();
                signOut();
              }}
            >
              Sign out
            </a>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Error Alert */}
        {errorMsg && <div className="alert-banner">⚠️ {errorMsg}</div>}

        {/* Phase / Welcome Card */}
        {!drawn && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">🎮 Game Lobby</span>
              <span className="phase-tag lobby">● Open for Joining</span>
            </div>

            {!me.joined ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <p style={{ color: "var(--text-muted)", marginBottom: "16px", fontSize: "15px" }}>
                  Join the room as <strong>{me.name}</strong> to be included in the secret draw.
                </p>
                <button
                  onClick={() => act("join")}
                  disabled={isActing}
                  className="btn btn-black btn-lg"
                >
                  Join Game as {me.name}
                </button>
              </div>
            ) : (
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>🎉</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#166534", fontSize: "15px" }}>You're in the game!</div>
                  <div style={{ fontSize: "13px", color: "#15803D" }}>Waiting for the organizer to draw matches.</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Secret Giftee Card (Visible only when drawn and user is playing) */}
        {drawn && me.joined && myMatch && (
          <div className="card" style={{ borderColor: "rgba(188, 0, 112, 0.25)" }}>
            <div className="card-header">
              <span className="card-title">🎁 Your Secret Giftee</span>
              <span className="phase-tag drawn">🔒 Confidential</span>
            </div>

            <div
              className="secret-reveal-box"
              onClick={() => setShowGiftee(!showGiftee)}
            >
              {showGiftee ? (
                <div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                    You are gifting to
                  </div>
                  <div className="secret-recipient-name">
                    {nameOf(myMatch)}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                    💡 Pitch a gift that fits them: inside joke, Monday problem solver, or ridiculous desk item!
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>👀</div>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-main)" }}>
                    Tap to reveal your giftee
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    (Make sure nobody is peeking at your screen!)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Pitch Stage */}
        {drawn && (
          <div className="card stage-card">
            <div className="card-header">
              <span className="card-title">
                {isPitching ? "🎤 Live Pitch Stage" : "🎪 Stage"}
              </span>
              {isPitching && (
                <span className="phase-tag drawn">Pitch {idx + 1} of {totalPitches}</span>
              )}
            </div>

            {idx < 0 && (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎁</div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "6px" }}>Matches Drawn!</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  Check your secret giftee above and prepare your pitch. The organizer will start pitches shortly.
                </p>
              </div>
            )}

            {isPitching && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div className="stage-pitch-number">Target Receiver</div>
                <div className="stage-target-name">{nameOf(currentReceiverId)}</div>

                {category && (
                  <div className="category-pill">
                    <span>🎲</span>
                    <span>{category}</span>
                  </div>
                )}

                {/* Digital Countdown Timer */}
                <div className="timer-container">
                  <div className={`timer-digits ${timeLeft <= 15 && timeLeft > 0 ? "urgent" : ""}`}>
                    {timeLeft > 0 ? (
                      <>
                        {Math.floor(timeLeft / 60)}:
                        {String(timeLeft % 60).padStart(2, "0")}
                      </>
                    ) : (
                      "Time's Up! ⏰"
                    )}
                  </div>
                </div>

                {/* Smooth Progress Bar */}
                <div style={{ width: "100%", height: "6px", background: "#E2E8F0", borderRadius: "9999px", overflow: "hidden", margin: "0 auto 20px" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      background: timeLeft <= 15 ? "var(--danger)" : "var(--brand-gradient)",
                      transition: "width 0.5s linear",
                    }}
                  />
                </div>

                {/* Giver Guessing Box */}
                <div className="giver-status-box">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>🕵️‍♂️</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                        Giver Identity
                      </div>
                      {d.revealed ? (
                        <div className="giver-revealed-text">
                          {nameOf(d.giver)} 🎁
                        </div>
                      ) : (
                        <div style={{ color: "var(--text-main)", fontWeight: 600 }}>
                          Hidden — Receiver, take your guess on call!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isPitchFinished && (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
                <h3 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>That's a wrap!</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  All pitches are done! Vote for your favorite gifts and pitches below.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Organizer Host Controls */}
        {me.host && (
          <div className="card" style={{ border: "1.5px solid rgba(188, 0, 112, 0.3)" }}>
            <div className="card-header">
              <span className="card-title">👑 Organizer Controls</span>
              <span className="phase-tag host">Host Only</span>
            </div>

            {!drawn ? (
              <div>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "14px" }}>
                  At least <strong>3 players</strong> are needed. Once all colleagues are in the lobby, click below to draw.
                </p>
                <button
                  onClick={() => act("draw")}
                  disabled={d.players.length < 3 || isActing}
                  className="btn btn-gradient btn-lg"
                  style={{ width: "100%" }}
                >
                  🎲 Draw Matches ({d.players.length} Players in Lobby)
                </button>
              </div>
            ) : (
              <div className="btn-group">
                <button
                  onClick={() => act("roll")}
                  disabled={isActing}
                  className="btn btn-outline"
                >
                  🎲 Roll Category
                </button>

                <button
                  onClick={() => act("next")}
                  disabled={idx >= totalPitches || isActing}
                  className="btn btn-black"
                >
                  {idx < 0 ? "▶ Start Pitches" : "▶ Next Pitch"}
                </button>

                <button
                  onClick={() => act("reveal")}
                  disabled={idx < 0 || idx >= totalPitches || d.revealed || isActing}
                  className="btn btn-gradient"
                >
                  👀 Reveal Giver
                </button>

                <button
                  onClick={() => act("announce")}
                  disabled={isActing}
                  className="btn btn-outline"
                >
                  🏆 Announce Winners
                </button>

                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to reset the draw? All matches will be wiped.")) {
                      act("reset");
                    }
                  }}
                  disabled={isActing}
                  className="btn btn-outline"
                  style={{ color: "var(--danger)", marginLeft: "auto" }}
                >
                  Reset Draw
                </button>
              </div>
            )}
          </div>
        )}

        {/* Participants Lobby Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">👥 Participants ({d.players.length})</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {drawn ? "In the game" : "Joined lobby"}
            </span>
          </div>

          <div className="chips-grid">
            {d.players.length === 0 ? (
              <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                Nobody has joined yet. Share the link with your team!
              </span>
            ) : (
              d.players.map((p) => {
                const isCurrentPlayer = p.id === me.id;
                return (
                  <span
                    className={`player-chip ${isCurrentPlayer ? "is-you" : ""}`}
                    key={p.id}
                  >
                    <span className="chip-initials">{getInitials(p.name)}</span>
                    <span>{p.name}{isCurrentPlayer ? " (you)" : ""}</span>
                    {me.host && !drawn && (
                      <button
                        title="Remove player"
                        className="chip-remove-btn"
                        onClick={() => act("remove", { id: p.id })}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Awards & Voting (When drawn and user is participating) */}
        {drawn && me.joined && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">🏆 Fun Friday Awards</span>
              {me.host && votesIn !== null && (
                <span className="phase-tag drawn">Votes in: {votesIn} / {d.players.length}</span>
              )}
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              {[
                ["a", "💡 Most Thoughtful Gift"],
                ["b", "🤣 Most Ridiculous Idea"],
                ["c", "🔥 Best Pitch Performance"],
              ].map(([key, label]) => (
                <div key={key} className="vote-item">
                  <label className="vote-label">{label}</label>
                  <select
                    className="vote-select"
                    value={getSelectedVote(key)}
                    onChange={(e) => setVotes({ ...votes, [key]: e.target.value })}
                  >
                    {awardCandidates.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                act("vote", {
                  a: getSelectedVote("a"),
                  b: getSelectedVote("b"),
                  c: getSelectedVote("c"),
                })
              }
              disabled={isActing}
              className="btn btn-black btn-lg"
              style={{ width: "100%", marginTop: "14px" }}
            >
              Submit My Votes
            </button>

            {/* Results Podium if announced */}
            {results && (
              <div className="podium-box">
                <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "12px", fontFamily: "Sora, sans-serif" }}>
                  🎉 Official Award Winners
                </div>
                <div className="podium-item">
                  <span className="podium-award">💡 Most Thoughtful</span>
                  <span className="podium-winner">{nameOf(results.a)}</span>
                </div>
                <div className="podium-item">
                  <span className="podium-award">🤣 Most Ridiculous</span>
                  <span className="podium-winner">{nameOf(results.b)}</span>
                </div>
                <div className="podium-item">
                  <span className="podium-award">🔥 Best Pitch</span>
                  <span className="podium-winner">{nameOf(results.c)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
