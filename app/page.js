"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { signIn, signOut } from "next-auth/react";
import { sounds, triggerGiftRain } from "@/lib/effects";

const PITCH_DURATION = 90;

const IDEA_SPARKS = [
  "A subscription that delivers emergency caffeine whenever a meeting runs 5 minutes over.",
  "A custom golden keyboard that only has an 'Enter' key and an 'Urgent' button.",
  "An AI hologram twin that attends 9 AM Monday standups on their behalf.",
  "A high-tech noise-cancelling headset that translates corporate buzzwords into plain English.",
  "A robotic desktop arm that automatically high-fives them every time they close a ticket.",
  "An emergency panic button on their desk that plays the Rocky theme song on command.",
  "A personalized coffee mug with their most-used Slack reaction printed on the handle.",
  "A lifetime supply of funny socks with their own face printed on them.",
  "A desk plant with an automated voice reminder that yells 'DRINK WATER!' every 45 minutes.",
  "An executive golden trophy for 'Surviving meetings that could have been an email'."
];

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
  const [showRules, setShowRules] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [giftTitle, setGiftTitle] = useState("");
  const [giftPitch, setGiftPitch] = useState("");
  const [giftSavedMsg, setGiftSavedMsg] = useState("");
  const [votes, setVotes] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [isActing, setIsActing] = useState(false);

  // Refs to track state transitions across polling
  const prevRevealedRef = useRef(false);
  const prevResultsRef = useRef(null);
  const prevIdxRef = useRef(-1);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.muted = nextMuted;
    if (!nextMuted) {
      sounds.pop();
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const copyGameLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin);
      showToast("Link copied to clipboard! Share it on Slack or Teams 🚀");
      sounds.pop();
    }
  };

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

      // Check if Giver was just revealed -> Trigger synced celebration on everyone's screen!
      if (j.revealed && !prevRevealedRef.current) {
        triggerGiftRain();
        sounds.fanfare();
      }
      prevRevealedRef.current = !!j.revealed;

      // Check if Winners were just announced
      if (j.results && !prevResultsRef.current) {
        triggerGiftRain();
        sounds.fanfare();
      }
      prevResultsRef.current = j.results;

      // Check if stage advanced to new pitch
      if (j.idx !== prevIdxRef.current && j.idx >= 0) {
        sounds.pop();
      }
      prevIdxRef.current = j.idx;

      setD(j);

      // Pre-fill my gift if already saved and user hasn't edited locally
      if (j.myGift && !giftTitle) {
        setGiftTitle(j.myGift.title || "");
        setGiftPitch(j.myGift.pitch || "");
      }
    } catch {
      // keep state on transient blip
    }
  }, [giftTitle]);

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
    if (action === "roll" || action === "pick_reader") {
      sounds.roulette();
    }
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

  const saveGift = async (e) => {
    e.preventDefault();
    if (!giftTitle.trim()) {
      setErrorMsg("Please enter a gift title!");
      return;
    }
    sounds.pop();
    await act("submit_gift", { title: giftTitle, pitch: giftPitch });
    setGiftSavedMsg("✅ Anonymous pitch saved! It will appear on screen during their turn.");
    setTimeout(() => setGiftSavedMsg(""), 4000);
  };

  const nextIdea = (e) => {
    e.stopPropagation();
    sounds.pop();
    setCurrentIdeaIndex((prev) => (prev + 1) % IDEA_SPARKS.length);
  };

  const handleRevealGifteeToggle = () => {
    if (!showGiftee) {
      sounds.fanfare();
      triggerGiftRain();
    }
    setShowGiftee(!showGiftee);
  };

  // ---------------------------------------------------------------------------
  // Rules Modal Component
  // ---------------------------------------------------------------------------
  const renderRulesModal = () => {
    if (!showRules) return null;
    return (
      <div className="modal-overlay" onClick={() => setShowRules(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setShowRules(false)}>✕</button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span className="event-badge">Rules & Guidelines</span>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>
            How Virtual Secret Santa Works 🎁
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>
            ₹0 budget, maximum banter! You type your anonymous gift pitch, and a <strong>random colleague</strong> is chosen on the spot to pitch it live on call!
          </p>

          <div className="rules-card-item">
            <div className="rules-icon-badge">🤫</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                1. 100% Confidential Match
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Once drawn, only you see your giftee on your screen. Do not tell anyone who you got!
              </div>
            </div>
          </div>

          <div className="rules-card-item">
            <div className="rules-icon-badge">📝</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                2. Type Your Anonymous Gift Pitch
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Type your funny gift idea and why they need it into the app. It stays completely anonymous.
              </div>
            </div>
          </div>

          <div className="rules-card-item">
            <div className="rules-icon-badge">🎤</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                3. The Random Presenter Twist!
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                When a pitch begins, the app randomly selects a colleague (the Bakra!) to turn on their mic and dramatically pitch the gift note like a TV salesperson!
              </div>
            </div>
          </div>

          <div className="rules-card-item">
            <div className="rules-icon-badge">🕵️‍♂️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                4. Receiver Guesses & Reveal
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Since the presenter didn't write it, the receiver has to guess: <em>"Who in the team secretly came up with this?"</em> before the organizer reveals the real giver!
              </div>
            </div>
          </div>

          <div className="rules-card-item">
            <div className="rules-icon-badge">🏆</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                5. Vote for Awards
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Vote for <strong>Most Thoughtful</strong>, <strong>Most Ridiculous</strong>, and <strong>Best Pitch</strong>!
              </div>
            </div>
          </div>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button className="btn btn-black btn-md" onClick={() => setShowRules(false)} style={{ width: "100%" }}>
              Got It, Let's Play!
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // 1. Unauthenticated View (Login)
  // ---------------------------------------------------------------------------
  if (!auth) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {renderRulesModal()}
        {toastMsg && <div className="toast-bar">{toastMsg}</div>}

        <header className="app-header">
          <div className="header-container">
            <div className="logo-badge-wrap">
              <ScansLogo />
              <span className="event-badge">Fun Friday</span>
            </div>
            <div className="header-actions">
              <button className="header-btn" onClick={() => setShowRules(true)}>
                📖 Rules
              </button>
              <button className="header-btn" onClick={copyGameLink}>
                📋 Copy Link
              </button>
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
              Anonymous gift pitches, random live presenters, zero prep, and hilarious reveals.
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
                <div className="step-desc">Sign in with Google and enter the game lobby.</div>
              </div>
              <div className="step-card">
                <div className="step-number">Step 02</div>
                <div className="step-title">Secret Pitch Note</div>
                <div className="step-desc">Type your gift pitch into the app completely anonymously.</div>
              </div>
              <div className="step-card">
                <div className="step-number">Step 03</div>
                <div className="step-title">Random Presenter</div>
                <div className="step-desc">Random colleague pitches it live, receiver guesses the real giver!</div>
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
  const { me, phase, order, idx, category, startedAt, results, myMatch, myVotes, votesIn, activeGift, readerId } = d;
  const drawn = phase === "drawn";
  const nameOf = (id) => d.players.find((p) => p.id === id)?.name || "Colleague";
  const currentReceiverId = order[idx];
  const totalPitches = order.length;
  const isPitching = idx >= 0 && idx < totalPitches;
  const isPitchFinished = idx >= totalPitches && totalPitches > 0;
  const isCurrentUserReader = readerId && readerId === me.id;

  // Timer math
  const elapsedSeconds = (now + skew - startedAt) / 1000;
  const timeLeft = Math.max(0, Math.ceil(PITCH_DURATION - elapsedSeconds));
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / PITCH_DURATION) * 100));

  // Eligible players for awards (everyone except yourself)
  const awardCandidates = d.players.filter((p) => p.id !== me.id);
  const getSelectedVote = (key) => votes[key] || myVotes?.[key] || awardCandidates[0]?.id || "";

  return (
    <div>
      {renderRulesModal()}
      {toastMsg && <div className="toast-bar">{toastMsg}</div>}

      {/* Sleek Top Navbar */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-badge-wrap">
            <ScansLogo />
            <span className="event-badge">Secret Santa</span>
          </div>

          <div className="header-actions">
            {/* Sound Mute/Unmute Toggle */}
            <button
              className="header-btn"
              onClick={toggleSound}
              title={isMuted ? "Unmute Sound FX" : "Mute Sound FX"}
            >
              {isMuted ? "🔇 Muted" : "🔊 Sound ON"}
            </button>

            <button className="header-btn" onClick={() => setShowRules(true)}>
              📖 Rules
            </button>

            <button className="header-btn" onClick={copyGameLink}>
              📋 Copy Link
            </button>

            <div className="user-pill">
              <span className="user-avatar-circle">{getInitials(me.name)}</span>
              <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {me.name}
              </span>
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

        {/* Phase / Lobby Card with Join & Leave Options */}
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
                  onClick={() => {
                    sounds.pop();
                    act("join");
                  }}
                  disabled={isActing}
                  className="btn btn-black btn-lg"
                >
                  Join Game as {me.name}
                </button>
              </div>
            ) : (
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "16px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "24px" }}>🎉</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#166534", fontSize: "15px" }}>You're in the game!</div>
                    <div style={{ fontSize: "13px", color: "#15803D" }}>Waiting for the organizer to draw matches.</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm("Leave the lobby? You won't be included in the secret draw.")) {
                      act("leave");
                    }
                  }}
                  disabled={isActing}
                  className="btn btn-danger-outline btn-sm"
                >
                  Leave Lobby
                </button>
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
              onClick={handleRevealGifteeToggle}
            >
              {showGiftee ? (
                <div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                    You are gifting to
                  </div>
                  <div className="secret-recipient-name">
                    {nameOf(myMatch)}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", marginBottom: "16px" }}>
                    💡 Type your gift idea below. A <strong>randomly selected colleague</strong> will pitch it aloud on call to keep full suspense!
                  </div>

                  {/* Anonymous Gift Submission Form */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ textAlign: "left", background: "#FFFFFF", padding: "18px", borderRadius: "14px", border: "1px solid #E2E8F0" }}
                  >
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px" }}>
                        Gift Title / Idea
                      </label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="e.g. Heated Arctic Suit for the 24°C Office AC"
                        value={giftTitle}
                        onChange={(e) => setGiftTitle(e.target.value)}
                      />
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px" }}>
                        Why they need it (Pitch Note for the Reader)
                      </label>
                      <textarea
                        className="text-input"
                        rows={3}
                        placeholder="e.g. Because even in summer they wear 3 hoodies to work! This suit comes with built-in heaters and hot tea dispenser."
                        value={giftPitch}
                        onChange={(e) => setGiftPitch(e.target.value)}
                      />
                    </div>

                    {giftSavedMsg && (
                      <div style={{ fontSize: "13px", color: "#166534", fontWeight: 600, marginBottom: "10px" }}>
                        {giftSavedMsg}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <button
                        onClick={saveGift}
                        disabled={isActing}
                        className="btn btn-black btn-sm"
                      >
                        Save Anonymous Pitch 💾
                      </button>

                      {d.myGift && (
                        <span style={{ fontSize: "12px", color: "#16A34A", fontWeight: 600 }}>
                          ✓ Saved in game
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pitch Idea Spark Generator */}
                  <div className="idea-box" onClick={(e) => e.stopPropagation()} style={{ marginTop: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--brand-blue)", letterSpacing: "0.05em" }}>
                        💡 Idea Spark
                      </span>
                      <button
                        onClick={nextIdea}
                        className="btn btn-outline btn-sm"
                        style={{ padding: "4px 10px", fontSize: "11px" }}
                      >
                        🎲 Another Idea
                      </button>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-main)", fontStyle: "italic", margin: 0 }}>
                      "{IDEA_SPARKS[currentIdeaIndex]}"
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>👀</div>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-main)" }}>
                    Tap to reveal your giftee & write your pitch
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
                  Check your secret giftee above and type your anonymous pitch. The organizer will start pitches shortly.
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

                {/* Randomly Selected Live Presenter / Reader Card */}
                {readerId && (
                  <div className={`reader-spotlight-box ${isCurrentUserReader ? "is-me" : ""}`}>
                    <div style={{ textAlign: "left" }}>
                      <div className="reader-meta-title">
                        {isCurrentUserReader ? "🔥 YOU ARE ON THE MIC!" : "🎙️ CHOSEN LIVE PRESENTER"}
                      </div>
                      <div className="reader-name-bold">
                        {nameOf(readerId)} {isCurrentUserReader ? "(YOU)" : ""}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {isCurrentUserReader
                          ? "Turn on your mic and dramatically pitch the gift note below!"
                          : `${nameOf(readerId)}, turn on your mic and dramatically sell this gift!`}
                      </div>
                    </div>

                    {me.host && (
                      <button
                        onClick={() => act("pick_reader")}
                        disabled={isActing}
                        title="Pick another random colleague"
                        className="btn btn-outline btn-sm"
                        style={{ background: "#FFFFFF", marginLeft: "auto" }}
                      >
                        🎲 Reroll Presenter
                      </button>
                    )}
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
                  {me.host && (
                    <button
                      onClick={() => act("addTime")}
                      title="Add 30 seconds"
                      className="btn btn-outline btn-sm"
                      style={{ height: "36px" }}
                    >
                      +30s ⏱
                    </button>
                  )}
                </div>

                {/* Smooth Progress Bar */}
                <div style={{ width: "100%", height: "6px", background: "#E2E8F0", borderRadius: "9999px", overflow: "hidden", margin: "0 auto 16px" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      background: timeLeft <= 15 ? "var(--danger)" : "var(--brand-gradient)",
                      transition: "width 0.5s linear",
                    }}
                  />
                </div>

                {/* Anonymous Pitch Presentation on Stage */}
                {activeGift ? (
                  <div className="anonymous-stage-pitch">
                    <div className="stage-gift-title">
                      🎁 {activeGift.title}
                    </div>
                    {activeGift.pitch && (
                      <div className="stage-gift-body">
                        "{activeGift.pitch}"
                      </div>
                    )}
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "10px", fontWeight: 600 }}>
                      👉 <strong>{nameOf(readerId || currentReceiverId)}</strong>, read this aloud! <strong>{nameOf(currentReceiverId)}</strong>, guess who in the team came up with this!
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "#F8FAFC", border: "1px dashed #CBD5E1", borderRadius: "14px", padding: "16px", margin: "16px 0", fontSize: "14px", color: "var(--text-muted)" }}>
                    💬 No written pitch submitted yet — Giver, give a quick verbal hint or drop a clue in chat!
                  </div>
                )}

                {/* Giver Guessing Box */}
                <div className="giver-status-box">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>🕵️‍♂️</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                        Real Giver Identity
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
                  onClick={() => {
                    sounds.fanfare();
                    act("draw");
                  }}
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
                  onClick={() => act("pick_reader")}
                  disabled={idx < 0 || idx >= totalPitches || isActing}
                  className="btn btn-outline"
                >
                  🎲 Reroll Presenter
                </button>

                <button
                  onClick={() => {
                    sounds.fanfare();
                    triggerGiftRain();
                    act("reveal");
                  }}
                  disabled={idx < 0 || idx >= totalPitches || d.revealed || isActing}
                  className="btn btn-gradient"
                >
                  👀 Reveal Giver
                </button>

                <button
                  onClick={() => {
                    sounds.fanfare();
                    triggerGiftRain();
                    act("announce");
                  }}
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
              onClick={() => {
                sounds.fanfare();
                act("vote", {
                  a: getSelectedVote("a"),
                  b: getSelectedVote("b"),
                  c: getSelectedVote("c"),
                });
              }}
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
