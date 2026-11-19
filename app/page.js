"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { sounds, triggerGiftRain, triggerFlowerRain, triggerDevStackRain, triggerNameRain, triggerComboRain } from "@/lib/effects";
import TeamRosterSidebar from "@/components/TeamRosterSidebar";

export const dynamic = "force-dynamic";

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

function formatRelativeTime(ts) {
  if (!ts) return "Just now";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
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
  const [isUnveiling, setIsUnveiling] = useState(false);
  const [unveilSecondsLeft, setUnveilSecondsLeft] = useState(15);
  const [showerMode, setShowerMode] = useState("names"); // 'names' | 'tech' | 'flowers' | 'mix'

  // Anonymous Rate & Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStars, setReviewStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewTarget, setReviewTarget] = useState("event");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Chief Guest Setup & Suspense State
  const [showCgModal, setShowCgModal] = useState(false);
  const [cgName, setCgName] = useState("");
  const [cgTitle, setCgTitle] = useState("Founder & CEO");
  const [cgPhotoUrl, setCgPhotoUrl] = useState("");
  const [cgPlayerId, setCgPlayerId] = useState("");
  const [showTeamSidebar, setShowTeamSidebar] = useState(false);
  const [clockTime, setClockTime] = useState("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setClockTime(d.toLocaleTimeString("en-US", { hour12: true }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Refs to track state transitions across polling
  const prevRevealedRef = useRef(false);
  const prevResultsRef = useRef(null);
  const prevIdxRef = useRef(-1);
  const prevInauguratedRef = useRef(null);
  const prevCgRevealedRef = useRef(null);

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

  const triggerInaugurationCelebration = useCallback((playersList) => {
    setIsUnveiling(true);
    setUnveilSecondsLeft(15);
    sounds.snip();
    sounds.applause(15);
    triggerNameRain(playersList, true);

    let sec = 15;
    const timerInterval = setInterval(() => {
      sec -= 1;
      setUnveilSecondsLeft(sec);
      if (sec % 3 === 0 && sec > 0) {
        triggerComboRain(playersList, true);
      }
      if (sec <= 0) {
        clearInterval(timerInterval);
        setIsUnveiling(false);
      }
    }, 1000);
  }, []);

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

      // Check if Winners were just announced -> Trigger celebration & prompt emotional review
      if (j.results && !prevResultsRef.current) {
        triggerGiftRain();
        sounds.fanfare();
        setReviewTarget("Final Event Review");
        setShowReviewModal(true);
      }
      prevResultsRef.current = j.results;

      // Check if stage advanced to new pitch
      if (j.idx !== prevIdxRef.current && j.idx >= 0) {
        sounds.pop();
      }
      prevIdxRef.current = j.idx;

      // Check if Inauguration ceremony just happened -> Primary High-Volume Crowd Clapping & Teammate Name Rain
      if (j.inaugurated && prevInauguratedRef.current === false) {
        triggerInaugurationCelebration(j.players || d?.players);
      }
      prevInauguratedRef.current = !!j.inaugurated;

      // Check if Chief Guest was just revealed -> Trigger royal drumroll, shehnai & celebration rain!
      if (prevCgRevealedRef.current !== null && j.chiefGuest?.revealed && !prevCgRevealedRef.current) {
        sounds.drumroll();
        sounds.shehnaiInauguration();
        triggerComboRain(j.players || d?.players, true);
      }
      prevCgRevealedRef.current = !!j.chiefGuest?.revealed;

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

  const triggerCustomShower = (mode = showerMode, grand = false) => {
    if (mode === "names") {
      sounds.fanfare();
      triggerNameRain(d?.players, grand);
    } else if (mode === "tech") {
      sounds.techPowerUp();
      triggerDevStackRain(grand);
    } else if (mode === "flowers") {
      sounds.flowerChime();
      triggerFlowerRain(grand);
    } else {
      sounds.fanfare();
      triggerComboRain(d?.players, grand);
    }
  };

  const handleRevealGifteeToggle = () => {
    if (!showGiftee) {
      sounds.fanfare();
      triggerNameRain(d?.players, false);
    }
    setShowGiftee(!showGiftee);
  };

  const handleCutRibbon = async () => {
    triggerInaugurationCelebration(d?.players);
    await act("inaugurate");
  };

  const handleSubmitReview = async (e) => {
    if (e) e.preventDefault();
    if (!reviewComment.trim() && !reviewStars) {
      setErrorMsg("Please select a star rating or write a comment.");
      return;
    }
    setReviewSubmitting(true);
    try {
      await act("review", {
        stars: reviewStars,
        comment: reviewComment,
        target: reviewTarget,
      });
      sounds.pop();
      setReviewSubmitted(true);
      showToast("Anonymous review submitted! Thank you! ⭐");
      setTimeout(() => {
        setReviewComment("");
        setReviewSubmitted(false);
      }, 2500);
    } catch {
      setErrorMsg("Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleShowerFlowers = async () => {
    triggerCustomShower(showerMode, false);
    await act("flower");
  };

  const handleSaveChiefGuest = async (e) => {
    e.preventDefault();
    if (!cgName.trim()) {
      setErrorMsg("Please enter Chief Guest name!");
      return;
    }
    await act("set_chief_guest", {
      name: cgName,
      title: cgTitle,
      photoUrl: cgPhotoUrl,
      id: cgPlayerId,
    });
    setShowCgModal(false);
    showToast("Chief Guest successfully assigned! 👑");
  };

  const handleRevealChiefGuest = async () => {
    sounds.drumroll();
    sounds.shehnaiInauguration();
    triggerComboRain(d?.players, true);
    await act("reveal_chief_guest");
    showToast("Chief Guest revealed to everyone with fanfare! 🌟");
  };

  // ---------------------------------------------------------------------------
  // Anonymous Rate & Review Modal
  // ---------------------------------------------------------------------------
  const renderReviewModal = () => {
    if (!showReviewModal) return null;
    const reviewList = d?.reviews || [];
    const avgRating = reviewList.length > 0
      ? (reviewList.reduce((acc, r) => acc + (r.stars || 5), 0) / reviewList.length).toFixed(1)
      : null;

    return (
      <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
        <div className="modal-content review-modal-card" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setShowReviewModal(false)}>✕</button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="event-badge">⭐ 100% Anonymous Review</span>
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "4px", color: "var(--text-main)" }}>
            Rate &amp; Review ✨
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "12px" }}>
            {reviewTarget === "event" || reviewTarget === "inauguration"
              ? "Share your honest star rating and review for Secret Santa 2050!"
              : `Reviewing: ${reviewTarget}`}
          </p>

          <div className="review-privacy-banner">
            <span style={{ fontSize: "18px" }}>🔒</span>
            <div>
              <strong>Complete Anonymity:</strong> Zero identity tracking. No names, IDs, or emails are saved with your feedback!
            </div>
          </div>

          {/* Interactive 5-Star Rating Selector */}
          <div style={{ textAlign: "center", margin: "20px 0 16px" }}>
            <div className="star-rating-row">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverStars || reviewStars) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    className={`star-rating-btn ${isFilled ? "filled" : ""}`}
                    onMouseEnter={() => setHoverStars(star)}
                    onMouseLeave={() => setHoverStars(0)}
                    onClick={() => setReviewStars(star)}
                    aria-label={`${star} star`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <div className="star-rating-label">
              {(() => {
                const current = hoverStars || reviewStars;
                if (current === 5) return "⭐⭐⭐⭐⭐ Outstanding & Memorable!";
                if (current === 4) return "⭐⭐⭐⭐ Great Pitch / Idea!";
                if (current === 3) return "⭐⭐⭐ Good & Fun!";
                if (current === 2) return "⭐⭐ Fair Attempt";
                return "⭐ Needs Improvement";
              })()}
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmitReview}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
                Anonymous Comment / Feedback:
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts, inside jokes, compliments, or suggestions anonymously..."
                maxLength={300}
                rows={3}
                className="text-input"
                style={{ width: "100%", resize: "none", padding: "10px 14px", fontFamily: "'Inter', sans-serif" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>🔒 Totally anonymous submission</span>
                <span>{reviewComment.length}/300</span>
              </div>
            </div>

            {reviewSubmitted ? (
              <div className="review-success-badge">
                ✅ Anonymous review submitted with fanfare!
              </div>
            ) : (
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="btn btn-gradient btn-lg"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {reviewSubmitting ? "Submitting..." : "🌟 Submit Anonymous Review"}
              </button>
            )}
          </form>

          {/* Live Anonymous Reviews Feed */}
          {reviewList.length > 0 && (
            <div style={{ marginTop: "22px", borderTop: "1px solid rgba(0, 0, 0, 0.08)", paddingTop: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-main)" }}>
                  Recent Anonymous Reviews ({reviewList.length})
                </span>
                {avgRating && (
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#F59E0B" }}>
                    ★ {avgRating} / 5.0 Rating
                  </span>
                )}
              </div>

              <div className="reviews-feed-list">
                {reviewList.slice(0, 10).map((rev) => (
                  <div key={rev.id || Math.random()} className="review-feed-item">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "#F59E0B", fontSize: "13px", letterSpacing: "1px" }}>
                          {"★".repeat(rev.stars || 5)}{"☆".repeat(5 - (rev.stars || 5))}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-main)" }}>
                          {rev.moniker || "Anonymous Colleague"}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {formatRelativeTime(rev.ts)}
                      </span>
                    </div>
                    {rev.comment && (
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.4" }}>
                        "{rev.comment}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Chief Guest Assignment Modal (Host Only)
  // ---------------------------------------------------------------------------
  const renderChiefGuestModal = () => {
    if (!showCgModal) return null;
    return (
      <div className="modal-overlay" onClick={() => setShowCgModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setShowCgModal(false)}>✕</button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span className="event-badge">👑 Chief Guest Setup</span>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>
            Assign VIP Chief Guest 🌟
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
            Assign our Founder or special VIP to inaugurate the event and cut the ribbon.
            Their identity stays <strong>100% hidden and server-redacted</strong> until you reveal them!
          </p>

          <form onSubmit={handleSaveChiefGuest}>
            {/* Quick Player Selection */}
            {d && d.players && d.players.length > 0 && (
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
                  Select from joined participants (Optional):
                </label>
                <select
                  value={cgPlayerId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setCgPlayerId(selId);
                    const found = d.players.find((p) => p.id === selId);
                    if (found) {
                      setCgName(found.name);
                    }
                  }}
                  className="text-input"
                  style={{ padding: "8px 12px", marginBottom: "8px" }}
                >
                  <option value="">-- Choose a Participant or Custom VIP below --</option>
                  {d.players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.host ? "(Host)" : ""}
                    </option>
                  ))}
                </select>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {d.players.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setCgPlayerId(p.id);
                        setCgName(p.name);
                      }}
                      className={`btn btn-sm ${cgPlayerId === p.id ? "btn-gradient" : "btn-outline"}`}
                      style={{ fontSize: "11px", padding: "3px 8px" }}
                    >
                      👑 {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
                Chief Guest Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Founder &amp; CEO"
                value={cgName}
                onChange={(e) => setCgName(e.target.value)}
                className="text-input"
                style={{ padding: "8px 12px" }}
                required
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
                Title / Designation
              </label>
              <input
                type="text"
                placeholder="e.g. Founder &amp; CEO / VP Engineering"
                value={cgTitle}
                onChange={(e) => setCgTitle(e.target.value)}
                className="text-input"
                style={{ padding: "8px 12px" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
                Photo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://... (or leave empty for royal monogram avatar)"
                value={cgPhotoUrl}
                onChange={(e) => setCgPhotoUrl(e.target.value)}
                className="text-input"
                style={{ padding: "8px 12px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowCgModal(false)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isActing}
                className="btn btn-gradient btn-sm"
              >
                👑 Save Chief Guest
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
                When a pitch begins, the app randomly selects a colleague (the chosen presenter) to turn on their mic and dramatically pitch the gift note like a TV salesperson!
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
              <Link
                href="/ai"
                className="header-btn"
                style={{
                  background: "linear-gradient(135deg, rgba(72,113,197,0.12) 0%, rgba(188,0,112,0.12) 100%)",
                  border: "1px solid rgba(188,0,112,0.25)",
                  color: "var(--brand-pink)",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                ⚡ How AI Built This
              </Link>
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
            <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "16px", gap: "8px", flexWrap: "wrap" }}>
              <span className="event-badge">🎁 Holiday Edition</span>
              <span
                style={{
                  background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(225,29,72,0.15) 100%)",
                  border: "1px solid rgba(245,158,11,0.4)",
                  color: "#B45309",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>🎀</span>
                <span>Grand Opening &amp; Ribbon Cutting</span>
              </span>
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
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
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

            {/* AI Showcase Banner */}
            <div
              style={{
                marginTop: "28px",
                padding: "16px 20px",
                background: "linear-gradient(135deg, rgba(72,113,197,0.06) 0%, rgba(188,0,112,0.06) 100%)",
                borderRadius: "14px",
                border: "1px solid rgba(72,113,197,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                textAlign: "left",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⚡</span> Built in 1 Evening with Antigravity AI
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  See how Himanshu paired with AI to ship this multiplayer game & supercharge backend velocity.
                </div>
              </div>
              <Link
                href="/ai"
                className="btn btn-black btn-sm"
                style={{ textDecoration: "none", whiteSpace: "nowrap", padding: "8px 16px", fontSize: "12px" }}
              >
                View AI Showcase ➔
              </Link>
            </div>
          </div>
        </main>

        <footer style={{ marginTop: "auto", padding: "20px 0", textAlign: "center", borderTop: "1px solid var(--card-border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
            <span
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4871C5, #BC0070)",
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              HJ
            </span>
            <span>
              Crafted for Fun Friday by <strong>Himanshu Jain</strong> with <strong>Antigravity AI</strong> •{" "}
              <Link href="/ai" style={{ color: "var(--brand-blue)", textDecoration: "none", fontWeight: 600 }}>
                See How It Was Built ↗
              </Link>
            </span>
          </div>
        </footer>
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
      {renderChiefGuestModal()}
      {renderReviewModal()}
      {toastMsg && <div className="toast-bar">{toastMsg}</div>}

      {/* Sleek Top Navbar */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-badge-wrap">
            <ScansLogo />
            <span className="event-badge">Secret Santa</span>
          </div>

          <div className="header-actions">
            <Link
              href="/ai"
              className="header-btn"
              style={{
                background: "linear-gradient(135deg, rgba(72,113,197,0.12) 0%, rgba(188,0,112,0.12) 100%)",
                border: "1px solid rgba(188,0,112,0.25)",
                color: "var(--brand-pink)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ⚡ How AI Built This
            </Link>

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

            <button
              className="header-btn"
              onClick={() => {
                setReviewTarget("event");
                setShowReviewModal(true);
              }}
              style={{ color: "#F59E0B", fontWeight: 700 }}
              title="Leave an anonymous star rating & comment"
            >
              ⭐ Rate &amp; Review ({d?.reviews?.length || 0})
            </button>

            <button
              onClick={() => setShowTeamSidebar(!showTeamSidebar)}
              className="header-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 700,
                color: showTeamSidebar ? "#BC0070" : "var(--text-main)",
                borderColor: showTeamSidebar ? "var(--brand-pink)" : "var(--card-border)",
              }}
              title="View Scans.ai Dream Team & Chief Guest"
            >
              <span>👥</span>
              <span>Team (16)</span>
            </button>

            <div className="user-pill" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span className="user-avatar-circle">{getInitials(me.name)}</span>
              <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {me.name}
              </span>
              {me.isAiInsider && (
                <span
                  title="⚡ AI Insider"
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: "6px",
                    background: "var(--brand-gradient)",
                    color: "#fff",
                    letterSpacing: "0.02em",
                  }}
                >
                  ⚡ Insider
                </span>
              )}
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

      <div className="app-stage-wrapper">
        <main className="stage-main-column">
          {/* Error Alert */}
          {errorMsg && <div className="alert-banner">⚠️ {errorMsg}</div>}

        {/* Grand Shop Inauguration & Ribbon Cutting Ceremony */}
        {(!d.inaugurated || isUnveiling) && (
          <div className={`inauguration-stage ${isUnveiling ? "curtains-open" : ""}`}>
            {/* Draped Royal Velvet Curtains on Left & Right */}
            <div className="curtain-drape-left" />
            <div className="curtain-drape-right" />

            {/* Prominent Ceremonial Red & Gold Ribbon with Golden Bow */}
            <div className="ceremonial-ribbon-wrapper">
              {isUnveiling ? (
                <div className="ceremonial-unveil-modal">
                  <div className="ceremonial-unveil-badge">✂️ OFFICIALLY INAUGURATED</div>
                  <h2 className="ceremonial-unveil-title">
                    Fun Friday 2050 Is Live! 🎉
                  </h2>
                  <div className="ceremonial-unveil-guest">
                    Inaugurated with Royal Honours by{" "}
                    <strong>{d.chiefGuest?.name || "Our Founder & CEO"}</strong>
                    {d.chiefGuest?.title && (
                      <span style={{ opacity: 0.9 }}> • {d.chiefGuest.title}</span>
                    )}
                  </div>
                  <div className="ceremonial-unveil-meter">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>👏 Thunderous Stadium Clapping</span>
                      <span style={{ color: "#FDE68A" }}>{Math.round(((15 - unveilSecondsLeft) / 15) * 100)}%</span>
                    </div>
                    <div className="ceremonial-meter-bar">
                      <div className="ceremonial-meter-fill" style={{ width: `${((15 - unveilSecondsLeft) / 15) * 100}%` }} />
                    </div>
                  </div>
                  <div className="ceremonial-unveil-timer">
                    Entering Live Game Arena in <strong>{unveilSecondsLeft}s</strong>...
                  </div>
                </div>
              ) : (
                <div className="ribbon-strap">
                  <div className="ribbon-golden-bow">🎀</div>
                </div>
              )}

              {/* Chief Guest Ribbon Cut Action (Tied directly to the ribbon) */}
              {!isUnveiling && (
                <div className="chief-guest-panel">
                  {d.chiefGuest?.revealed ? (
                    d.chiefGuest.isMe ? (
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
                          🎖️ CHIEF GUEST VIP PRIVILEGE
                        </div>
                        <button
                          onClick={handleCutRibbon}
                          disabled={isActing || isUnveiling}
                          className="btn-scissors-cut"
                        >
                          ✂️ Cut the Ribbon &amp; Inaugurate (Chief Guest)
                        </button>
                        <div style={{ fontSize: "12px", color: "#FDE68A", opacity: 0.85, marginTop: "8px" }}>
                          As our Chief Guest, snipping the ribbon will inaugurate the event with royal fanfare for everyone!
                        </div>
                      </div>
                    ) : me.host ? (
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
                          👑 ORGANIZER ACTION (CHIEF GUEST: {d.chiefGuest.name})
                        </div>
                        <button
                          onClick={handleCutRibbon}
                          disabled={isActing || isUnveiling}
                          className="btn-scissors-cut"
                        >
                          ✂️ Cut the Ribbon as Organizer (Fallback)
                        </button>
                        <div style={{ fontSize: "12px", color: "#FDE68A", opacity: 0.85, marginTop: "8px" }}>
                          Chief Guest ({d.chiefGuest.name}) can also cut the ribbon directly from their screen!
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", padding: "10px 20px", borderRadius: "9999px", color: "#FDE68A", fontSize: "14px", fontWeight: 700 }}>
                        <span>✂️</span>
                        <span>Awaiting Chief Guest (<strong>{d.chiefGuest.name}</strong>) to cut the ceremonial ribbon! 🎀</span>
                      </div>
                    )
                  ) : d.chiefGuest?.assigned ? (
                    me.host ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <button
                          onClick={handleRevealChiefGuest}
                          disabled={isActing}
                          className="btn btn-gradient btn-lg"
                          style={{ boxShadow: "0 0 25px rgba(245, 158, 11, 0.6)" }}
                        >
                          🌟 Reveal Chief Guest ({d.chiefGuest.name}) with Fanfare!
                        </button>
                        <button
                          onClick={handleCutRibbon}
                          disabled={isActing || isUnveiling}
                          className="btn-scissors-cut"
                          style={{ fontSize: "14px", padding: "10px 24px" }}
                        >
                          ✂️ Cut Ribbon Directly as Organizer
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", padding: "10px 20px", borderRadius: "9999px", color: "#FDE68A", fontSize: "14px", fontWeight: 700 }}>
                        <span>🤫</span>
                        <span>Mystery Chief Guest will be revealed soon... Stay tuned! 🌟</span>
                      </div>
                    )
                  ) : me.host ? (
                    <div>
                      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                        <button
                          onClick={() => setShowCgModal(true)}
                          disabled={isActing}
                          className="btn btn-gradient btn-sm"
                        >
                          👑 Assign VIP Chief Guest (e.g. Founder)
                        </button>
                      </div>
                      <button
                        onClick={handleCutRibbon}
                        disabled={isActing || isUnveiling}
                        className="btn-scissors-cut"
                      >
                        ✂️ Cut the Ribbon &amp; Inaugurate
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", padding: "10px 20px", borderRadius: "9999px", color: "#FDE68A", fontSize: "14px", fontWeight: 700 }}>
                      <span>⏳</span>
                      <span>Awaiting Chief Guest / Organizer to cut the ceremonial ribbon... Stay tuned! 🎀</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Inner Content Card (Interactive Banner, Flower shower & VIP check-in) */}
            <div className="stage-inner-card">
              <div className="inauguration-badge">
                <span>🎉</span> GRAND INAUGURATION
              </div>

              {/* Chief Guest Spotlight or Mystery Card */}
              {d.chiefGuest?.revealed ? (
                <div className="chief-guest-spotlight-card">
                  <div className="cg-spotlight-badge">
                    <span>👑</span> Honorable Chief Guest
                  </div>
                  <div className="cg-avatar-wrapper">
                    <div className="cg-avatar-ring">
                      {d.chiefGuest.photoUrl ? (
                        <img src={d.chiefGuest.photoUrl} alt={d.chiefGuest.name} className="cg-avatar-img" />
                      ) : (
                        <div className="cg-avatar-img" style={{ color: "#FFF", fontWeight: 800 }}>
                          {getInitials(d.chiefGuest.name)}
                        </div>
                      )}
                    </div>
                    <span className="cg-crown-icon">👑</span>
                  </div>
                  <div className="cg-name">{d.chiefGuest.name}</div>
                  <div className="cg-title">{d.chiefGuest.title || "Founder & CEO"}</div>
                  <div className="cg-vip-tag">
                    {d.chiefGuest.isMe ? "🎖️ YOU ARE OUR CHIEF GUEST! CUT THE RIBBON ABOVE!" : "Presiding over Grand Inauguration"}
                  </div>
                </div>
              ) : d.chiefGuest?.assigned ? (
                <div className="chief-guest-mystery-box">
                  <div className="mystery-avatar-silhouette">
                    <span>?</span>
                  </div>
                  <div className="mystery-cg-title">
                    🤫 Mystery Chief Guest Assigned!
                  </div>
                  <div className="mystery-cg-sub">
                    Who will inaugurate Scans.ai Secret Santa? The organizer will reveal our VIP Chief Guest with a drumroll soon!
                  </div>
                  {me.host && (
                    <div style={{ marginTop: "12px" }}>
                      <button
                        onClick={handleRevealChiefGuest}
                        disabled={isActing}
                        className="btn btn-gradient btn-sm"
                      >
                        🌟 Reveal Chief Guest ({d.chiefGuest.name}) with Fanfare
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              <h1 className="inauguration-title">
                Secret Santa 2050 Grand Inauguration 🛍️
              </h1>

              <p className="inauguration-desc">
                Awaiting the ceremonial ribbon cutting ceremony!<br />
                Meanwhile, shower developer tools, show your support &amp; claim your VIP Pass!
              </p>

              {/* Visual Live Clock & Room Status Ticker */}
              <div className="live-meeting-clock-card">
                <div className="live-clock-status">
                  <span className="live-pulse-dot" />
                  <span className="live-status-text">ROOM READY • AWAITING INAUGURATION</span>
                </div>

                <div className="live-clock-digits-wrapper">
                  <span className="clock-icon">🕒</span>
                  <span className="live-clock-digits">{clockTime || "LIVE"}</span>
                  <span className="live-clock-badge">REAL-TIME</span>
                </div>

                <div className="live-clock-sub">
                  Fun Friday meeting can start anytime! When Chief Guest cuts the ribbon, celebration begins.
                </div>
              </div>

              {/* Interactive Live Shower with Mode Selector */}
              <div style={{ margin: "22px 0" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
                  <div className="shower-mode-pills">
                    <button
                      type="button"
                      className={`shower-mode-pill ${showerMode === "names" ? "active" : ""}`}
                      onClick={() => setShowerMode("names")}
                    >
                      👤 Team Names
                    </button>
                    <button
                      type="button"
                      className={`shower-mode-pill ${showerMode === "tech" ? "active" : ""}`}
                      onClick={() => setShowerMode("tech")}
                    >
                      ⚡ Tech Tools
                    </button>
                    <button
                      type="button"
                      className={`shower-mode-pill ${showerMode === "flowers" ? "active" : ""}`}
                      onClick={() => setShowerMode("flowers")}
                    >
                      🌸 Flowers
                    </button>
                    <button
                      type="button"
                      className={`shower-mode-pill ${showerMode === "mix" ? "active" : ""}`}
                      onClick={() => setShowerMode("mix")}
                    >
                      🎲 Mixed
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleShowerFlowers}
                  disabled={isActing}
                  className="btn-flower-shower"
                >
                  {showerMode === "names" && "👤 Shower Team Names (Celebration) 🎉"}
                  {showerMode === "tech" && "⚡ Shower Developer Tools (Dev Storm) 🚀"}
                  {showerMode === "flowers" && "🌸 Shower Festive Flowers (Blossoms) ✨"}
                  {showerMode === "mix" && "🎲 Shower Mega Mix Celebration 🎊"}
                </button>

                <div>
                  <div className="flower-live-pill">
                    <span>✨🎉</span>
                    <span>{d.flowerCount || 0} Celebrations Showered</span>
                  </div>
                </div>
              </div>

              {/* Live Ticker for Colleagues waiting */}
              <div className="inauguration-ticker">
                <span>👥</span>
                <span>
                  <strong>{d.players.length} Colleagues</strong> checked in and waiting in suspense...
                </span>
              </div>

              {/* Guest Check-in / VIP Entry status */}
              <div style={{ marginTop: "16px" }}>
                {!me.joined ? (
                  <button
                    onClick={() => {
                      sounds.pop();
                      act("join");
                    }}
                    disabled={isActing}
                    className="btn btn-black btn-lg"
                    style={{ width: "100%", maxWidth: "340px", background: "#FFFFFF", color: "#000000" }}
                  >
                    🎟️ Join &amp; Claim VIP Pass as {me.name}
                  </button>
                ) : (
                  <div
                    style={{
                      background: "rgba(34, 197, 94, 0.2)",
                      border: "1px solid rgba(74, 222, 128, 0.4)",
                      borderRadius: "12px",
                      padding: "10px 16px",
                      color: "#86EFAC",
                      fontWeight: 700,
                      fontSize: "14px",
                      display: "inline-block",
                    }}
                  >
                    ✅ VIP Pass Confirmed! You are in the room.
                  </div>
                )}
              </div>

              {/* Quick links while waiting */}
              <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowRules(true)}
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: "rgba(255,255,255,0.3)", color: "#FFFFFF" }}
                >
                  📖 Rules &amp; How to Play
                </button>
                <button
                  onClick={() => {
                    setReviewTarget("inauguration");
                    setShowReviewModal(true);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: "rgba(245, 158, 11, 0.6)", color: "#FDE68A" }}
                >
                  ⭐ Rate Ceremony ({d?.reviews?.length || 0})
                </button>
                <Link
                  href="/ai"
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: "rgba(255,255,255,0.3)", color: "#FDA4AF", textDecoration: "none" }}
                >
                  ⚡ How AI Built This
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Game Interface (visible when inaugurated) */}
        {(d.inaugurated && !isUnveiling) && (
          <>
            {/* Meeting Live Celebration Bar: Shower Teammates, Tech, Flowers */}
            <div className="meeting-celebration-bar">
              <div className="celebration-title">
                <span style={{ fontSize: "18px" }}>🎉</span>
                <span><strong>Meeting Celebration:</strong> Shower colleagues &amp; cheer live!</span>
              </div>

              <div className="shower-mode-pills">
                <button
                  type="button"
                  className={`shower-mode-pill ${showerMode === "names" ? "active" : ""}`}
                  onClick={() => setShowerMode("names")}
                >
                  👤 Team Names
                </button>
                <button
                  type="button"
                  className={`shower-mode-pill ${showerMode === "tech" ? "active" : ""}`}
                  onClick={() => setShowerMode("tech")}
                >
                  ⚡ Tech Tools
                </button>
                <button
                  type="button"
                  className={`shower-mode-pill ${showerMode === "flowers" ? "active" : ""}`}
                  onClick={() => setShowerMode("flowers")}
                >
                  🌸 Flowers
                </button>
                <button
                  type="button"
                  className={`shower-mode-pill ${showerMode === "mix" ? "active" : ""}`}
                  onClick={() => setShowerMode("mix")}
                >
                  🎲 Mixed
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={handleShowerFlowers}
                  disabled={isActing}
                  className="btn-shower-quick"
                >
                  {showerMode === "names" && "👤 Shower Names ✨"}
                  {showerMode === "tech" && "⚡ Shower Tools 🚀"}
                  {showerMode === "flowers" && "🌸 Shower Flowers 🌺"}
                  {showerMode === "mix" && "🎲 Mega Mix 🎊"}
                </button>
                <div className="shower-counter-pill" title="Total celebrations showered">
                  <span>✨</span> {d.flowerCount || 0}
                </div>
                <button
                  onClick={() => {
                    setReviewTarget("event");
                    setShowReviewModal(true);
                  }}
                  className="btn-rate-review"
                  title="Leave an anonymous star rating & comment"
                >
                  ⭐ Rate &amp; Review ({d?.reviews?.length || 0})
                </button>
              </div>
            </div>
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
              <>
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

                {/* While You Wait AI Story Hook */}
                <div
                  style={{
                    marginTop: "14px",
                    padding: "16px 18px",
                    background: "linear-gradient(135deg, rgba(72,113,197,0.08) 0%, rgba(188,0,112,0.08) 100%)",
                    borderRadius: "14px",
                    border: "1px solid rgba(188,0,112,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>⚡</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text-main)" }}>
                        {me.isAiInsider
                          ? "🌟 You unlocked the [⚡ AI Insider] Badge!"
                          : "🎁 While you wait: Unlock your [⚡ AI Insider] Badge!"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {me.isAiInsider
                          ? "Test the Web Audio synthesizer lab, reactions, and CarScan architecture."
                          : "Read how this game was coded in 1 evening with Antigravity AI to claim your badge."}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/ai"
                    className="btn btn-black btn-sm"
                    style={{ textDecoration: "none", whiteSpace: "nowrap", padding: "8px 16px", fontSize: "12px" }}
                  >
                    {me.isAiInsider ? "Revisit AI Hub ➔" : "Read & Claim Badge ➔"}
                  </Link>
                </div>
              </>
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

            {d.chiefGuest?.assigned && (d.chiefGuest.revealed || me.host) && (
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#D97706",
                }}>
                  👑 Inaugurated by Chief Guest: <strong>{d.chiefGuest.name}</strong>
                </span>
              </div>
            )}

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

                    <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => {
                          setReviewTarget(activeGift.title || "Current Pitch");
                          setShowReviewModal(true);
                        }}
                        className="btn-rate-review"
                      >
                        ⭐ Rate &amp; Review this Pitch (Anonymous)
                      </button>
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

                <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <button
                    onClick={() => {
                      if (confirm("⚠️ NUCLEAR RESET: This will wipe ALL game state, players, matches, votes, gifts, flower count, and Chief Guest from Upstash Redis and clear memory cache to 0 KB.\n\nAre you ABSOLUTELY sure?")) {
                        act("nuclear_reset");
                      }
                    }}
                    disabled={isActing}
                    className="btn-nuclear-reset"
                    title="Zero cache wipe - purges all Redis keys"
                  >
                    🧹 Nuclear Reset (0 KB)
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Replay ribbon cutting ceremony? Curtains and ribbon will close again for suspense.")) {
                        act("reset_inauguration");
                      }
                    }}
                    disabled={isActing}
                    className="btn btn-outline btn-sm"
                    title="Reclose curtains & ribbon for testing or suspense"
                  >
                    🎀 Replay Ribbon Ceremony
                  </button>
                </div>
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
                    sounds.drumroll();
                    triggerComboRain(d?.players, true);
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
                    triggerNameRain(d?.players, true);
                    act("announce");
                  }}
                  disabled={isActing}
                  className="btn btn-outline"
                >
                  🏆 Announce Winners
                </button>

                <button
                  onClick={() => {
                    if (confirm("Replay ribbon cutting ceremony? Curtains and ribbon will close again for suspense.")) {
                      act("reset_inauguration");
                    }
                  }}
                  disabled={isActing}
                  className="btn btn-outline"
                  title="Reclose curtains & ribbon for testing or suspense"
                >
                  🎀 Replay Ceremony
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

                <button
                  onClick={() => {
                    if (confirm("⚠️ NUCLEAR RESET: This will wipe ALL game state, players, matches, votes, gifts, flower count, and Chief Guest from Upstash Redis and clear memory cache to 0 KB.\n\nAre you ABSOLUTELY sure?")) {
                      act("nuclear_reset");
                    }
                  }}
                  disabled={isActing}
                  className="btn-nuclear-reset"
                  title="Zero cache wipe - purges all Redis keys"
                >
                  🧹 Nuclear Reset (0 KB)
                </button>
              </div>
            )}

            {/* Chief Guest Management Section */}
            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px dashed rgba(188,0,112,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--brand-pink)" }}>
                  👑 Chief Guest Controls
                </span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      if (d.chiefGuest) {
                        setCgName(d.chiefGuest.name || "");
                        setCgTitle(d.chiefGuest.title || "Founder & CEO");
                        setCgPhotoUrl(d.chiefGuest.photoUrl || "");
                        setCgPlayerId(d.chiefGuest.id || "");
                      }
                      setShowCgModal(true);
                    }}
                    disabled={isActing}
                    className="btn btn-outline btn-sm"
                  >
                    {d.chiefGuest?.assigned ? "✏️ Edit Chief Guest" : "➕ Assign Chief Guest"}
                  </button>
                  {d.chiefGuest?.assigned && !d.chiefGuest?.revealed && (
                    <button
                      onClick={handleRevealChiefGuest}
                      disabled={isActing}
                      className="btn btn-gradient btn-sm"
                    >
                      🌟 Reveal with Fanfare
                    </button>
                  )}
                  {d.chiefGuest?.assigned && (
                    <button
                      onClick={() => {
                        if (confirm("Reset Chief Guest? The identity will be removed.")) {
                          act("reset_chief_guest");
                        }
                      }}
                      disabled={isActing}
                      className="btn btn-outline btn-sm"
                    >
                      🔄 Clear Chief Guest
                    </button>
                  )}
                </div>
              </div>
              {d.chiefGuest?.assigned && (
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Assigned: <strong>{d.chiefGuest.name}</strong> ({d.chiefGuest.title || "VIP"}) — Status:{" "}
                  <span style={{ color: d.chiefGuest.revealed ? "#10B981" : "#F59E0B", fontWeight: 700 }}>
                    {d.chiefGuest.revealed ? "Revealed to All (Public)" : "Mystery Silhouette (Redacted on server for non-hosts)"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
          </>
        )}

        {/* Participants Lobby Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">👥 Participants ({d.players.length})</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {drawn ? "In the game" : "Joined lobby"}
            </span>
          </div>

          {/* Chief Guest VIP Card in the Lobby */}
          {d.chiefGuest?.assigned && (
            <div className="lobby-chief-guest-banner">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "24px" }}>👑</span>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Chief Guest of Honour
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-main)" }}>
                    {d.chiefGuest.revealed ? (
                      <span>
                        {d.chiefGuest.name}
                        {d.chiefGuest.title && (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500, marginLeft: "6px" }}>
                            • {d.chiefGuest.title}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span style={{ color: "#D97706" }}>
                        🔒 Top Secret Mystery VIP • Revealed at Inauguration!
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className={`badge ${d.inaugurated ? "badge-blue" : "badge-green"}`} style={{ fontSize: "11px" }}>
                  {d.inaugurated ? "✅ Inaugurated" : "✂️ Ready for Ribbon Cut"}
                </span>
                {me.host && !drawn && (
                  <button
                    onClick={() => setShowCgModal(true)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: "11px", padding: "4px 10px" }}
                  >
                    ✏️ Edit VIP
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="chips-grid">
            {d.players.length === 0 ? (
              <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                Nobody has joined yet. Share the link with your team!
              </span>
            ) : (
              d.players.map((p) => {
                const isCurrentPlayer = p.id === me.id;
                const isCg = d.chiefGuest?.assigned && (
                  (d.chiefGuest.id && p.id === d.chiefGuest.id) ||
                  (d.chiefGuest.name && p.name && p.name.toLowerCase() === d.chiefGuest.name.toLowerCase())
                );
                return (
                  <span
                    className={`player-chip ${isCurrentPlayer ? "is-you" : ""}`}
                    key={p.id}
                    style={isCg && d.chiefGuest?.revealed ? { border: "1.5px solid #F59E0B", background: "rgba(245, 158, 11, 0.08)" } : {}}
                  >
                    <span className="chip-initials">{getInitials(p.name)}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      {p.name}{isCurrentPlayer ? " (you)" : ""}
                      {isCg && d.chiefGuest?.revealed && (
                        <span
                          title="👑 Chief Guest of Honour"
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "1px 6px",
                            borderRadius: "4px",
                            background: "linear-gradient(135deg, #F59E0B, #D97706)",
                            color: "#fff",
                            boxShadow: "0 2px 6px rgba(245, 158, 11, 0.3)",
                          }}
                        >
                          👑 Chief Guest
                        </span>
                      )}
                      {p.isAiInsider && (
                        <span
                          title="⚡ AI Insider: Unlocked by reading the story"
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "1px 5px",
                            borderRadius: "4px",
                            background: "var(--brand-gradient)",
                            color: "#fff",
                            letterSpacing: "0.02em",
                          }}
                        >
                          ⚡ Insider
                        </span>
                      )}
                    </span>
                    {me.host && !drawn && !isCg && (
                      <button
                        title={`Make ${p.name} Chief Guest`}
                        className="chip-remove-btn"
                        style={{ color: "#F59E0B", marginRight: "3px" }}
                        onClick={() => {
                          setCgPlayerId(p.id);
                          setCgName(p.name);
                          act("set_chief_guest", {
                            name: p.name,
                            title: "Founder & CEO",
                            id: p.id,
                          });
                          showToast(`👑 ${p.name} assigned as Chief Guest!`);
                        }}
                      >
                        👑
                      </button>
                    )}
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

        {/* Awards & Voting (When drawn, inaugurated, and user is participating) */}
        {d.inaugurated && !isUnveiling && drawn && me.joined && (
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
              <>
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

                {/* Heartfelt End-of-Game Tribute & Emotional Review Prompt */}
                <div className="endgame-tribute-card">
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                    <div className="tribute-badge">
                      <span>❤️</span> A SPECIAL NOTE FOR TEAM SCANS.AI
                    </div>
                  </div>

                  <h3 className="tribute-title">
                    What a Historic Fun Friday! 🎉
                  </h3>

                  <p className="tribute-body">
                    Every pitch, every laugh, and every thoughtful surprise made this Secret Santa 2050 truly unforgettable.
                    Over the last <strong>48 sleepless hours</strong>, this platform was crafted with deep heart, engineering passion, and Antigravity AI specifically for our incredible team.
                  </p>

                  <p className="tribute-highlight">
                    If you enjoyed today's session, it would mean the world to us if you could drop an honest anonymous review below and check out the story behind how AI powered this entire experience.
                  </p>

                  <div className="tribute-actions">
                    <button
                      onClick={() => {
                        setReviewTarget("Final Event Review");
                        setShowReviewModal(true);
                      }}
                      className="btn btn-gradient btn-lg"
                      style={{ boxShadow: "0 6px 20px rgba(188, 0, 112, 0.45)" }}
                    >
                      ⭐ Leave an Anonymous Review (Takes 5s!)
                    </button>

                    <Link
                      href="/ai"
                      className="btn btn-black btn-lg"
                      style={{ textDecoration: "none", background: "#0F172A", border: "1px solid rgba(255,255,255,0.2)" }}
                    >
                      ⚡ Behind the Scenes: How AI Built This (48h Journey) ↗
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        </main>

        <TeamRosterSidebar
          chiefGuest={d.chiefGuest}
          isOpen={showTeamSidebar}
          onClose={() => setShowTeamSidebar(false)}
        />
      </div>

      <footer style={{ marginTop: "auto", padding: "20px 0", textAlign: "center", borderTop: "1px solid var(--card-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
          <span
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4871C5, #BC0070)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            HJ
          </span>
          <span>
            Crafted for Fun Friday by <strong>Himanshu Jain</strong> with <strong>Antigravity AI</strong> •{" "}
            <Link href="/ai" style={{ color: "var(--brand-blue)", textDecoration: "none", fontWeight: 600 }}>
              See How It Was Built ↗
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
