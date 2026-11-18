"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { sounds, triggerGiftRain } from "@/lib/effects";

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

export default function AIShowcasePage() {
  const [activeTab, setActiveTab] = useState("quick"); // "quick" | "deep"
  const [deepSection, setDeepSection] = useState("secret-santa"); // "secret-santa" | "carscan" | "maturity" | "playbook"
  const [claimedBadge, setClaimedBadge] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [comparisonMode, setComparisonMode] = useState("himanshu"); // "traditional" | "himanshu"
  const [reactions, setReactions] = useState({ blown: 42, speed: 38, banter: 56, op: 64 });
  const [userReacted, setUserReacted] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("ai_insider") === "true") {
        setClaimedBadge(true);
      }
    }
    // Fetch live reactions from Redis
    fetch("/api/reactions")
      .then((res) => res.json())
      .then((data) => {
        if (data?.counts) setReactions(data.counts);
      })
      .catch(() => {});
  }, []);

  const handleClaimBadge = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      sounds.fanfare();
      triggerGiftRain();
      if (typeof window !== "undefined") {
        localStorage.setItem("ai_insider", "true");
      }
      setClaimedBadge(true);
      // Persist in Redis
      await Promise.allSettled([
        fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "claim_badge" }),
        }),
        fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "claim_insider" }),
        }),
      ]);
    } catch {}
    setClaiming(false);
  };

  const handleReaction = async (type) => {
    if (userReacted[type]) return;
    sounds.pop();
    setUserReacted((prev) => ({ ...prev, [type]: true }));
    setReactions((prev) => ({ ...prev, [type]: (prev[type] || 0) + 1 }));

    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
    } catch {}
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-color)" }}>
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-badge-wrap">
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <ScansLogo />
            </Link>
            <span className="event-badge" style={{ background: "var(--brand-gradient)", color: "#fff", border: "none" }}>
              ⚡ AI Showcase
            </span>
          </div>

          <div className="header-actions">
            {/* View Switcher Pill */}
            <div
              style={{
                display: "flex",
                background: "var(--chip-bg)",
                padding: "3px",
                borderRadius: "10px",
                border: "1px solid var(--card-border)",
              }}
            >
              <button
                onClick={() => setActiveTab("quick")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "7px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: activeTab === "quick" ? "#fff" : "transparent",
                  color: activeTab === "quick" ? "var(--text-main)" : "var(--text-muted)",
                  boxShadow: activeTab === "quick" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                ⚡ 1-Pager Showcase
              </button>
              <button
                onClick={() => setActiveTab("deep")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "7px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: activeTab === "deep" ? "#fff" : "transparent",
                  color: activeTab === "deep" ? "var(--text-main)" : "var(--text-muted)",
                  boxShadow: activeTab === "deep" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                🔬 Technical Deep-Dive
              </button>
            </div>

            <Link href="/" className="header-btn" style={{ textDecoration: "none" }}>
              🎁 Back to Game
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flex: 1, paddingBottom: "60px" }}>
        {activeTab === "quick" ? (
          /* =========================================================================
             VERSION 1: 1-PAGER QUICK SHOWCASE (FUN FRIDAY PRESENTATION)
             ========================================================================= */
          <div>
            {/* Hero Section */}
            <div
              className="card"
              style={{
                textAlign: "center",
                padding: "44px 24px 36px",
                marginBottom: "32px",
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(72,113,197,0.2)",
                background: "linear-gradient(180deg, rgba(72,113,197,0.04) 0%, rgba(188,0,112,0.02) 100%, #ffffff 100%)",
              }}
            >
              {/* Himanshu Creator Badge */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "6px 16px",
                    borderRadius: "100px",
                    background: "#ffffff",
                    border: "1px solid var(--card-border)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <img
                    src="https://github.com/himanshujainpro.png"
                    alt="Himanshu Jain"
                    style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-main)" }}>
                    Himanshu Jain
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--brand-pink)",
                      fontWeight: 600,
                      borderLeft: "1px solid var(--card-border)",
                      paddingLeft: "10px",
                    }}
                  >
                    AI-Native Software Architect
                  </span>
                </div>
              </div>

              <h1
                style={{
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 800,
                  fontFamily: "Sora, sans-serif",
                  letterSpacing: "-0.02em",
                  color: "var(--primary-black)",
                  marginBottom: "16px",
                  lineHeight: 1.2,
                }}
              >
                Built in One Evening with <br />
                <span
                  style={{
                    background: "var(--brand-gradient)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Antigravity AI & Himanshu
                </span>
              </h1>

              <p
                style={{
                  fontSize: "16px",
                  color: "var(--text-muted)",
                  maxWidth: "680px",
                  margin: "0 auto 32px",
                  lineHeight: 1.6,
                }}
              >
                How I pair with autonomous AI agents to turn ideas into live production software
                and bulletproof microservices at <strong>10x developer velocity</strong>—and how you can do it too.
              </p>

              {/* Big Metric Strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "16px",
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    background: "#ffffff",
                    padding: "18px 12px",
                    borderRadius: "14px",
                    border: "1px solid var(--card-border)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--brand-blue)" }}>~1 Evening</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>
                    Idea to Live Vercel App
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    padding: "18px 12px",
                    borderRadius: "14px",
                    border: "1px solid var(--card-border)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--brand-pink)" }}>8 Rapid Rounds</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>
                    Live Feature Iterations
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    padding: "18px 12px",
                    borderRadius: "14px",
                    border: "1px solid var(--card-border)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--success)" }}>10+ Custom Skills</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>
                    CarScan Backend AI Arsenal
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    padding: "18px 12px",
                    borderRadius: "14px",
                    border: "1px solid var(--card-border)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-main)" }}>0 Regressions</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>
                    Maker-Checker Verified
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE FEATURE 1: Web Audio Synth Playground */}
            <div
              className="card"
              style={{
                padding: "28px 24px",
                marginBottom: "36px",
                border: "2px solid rgba(72,113,197,0.25)",
                background: "linear-gradient(135deg, rgba(72,113,197,0.06) 0%, rgba(188,0,112,0.04) 100%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <span className="event-badge" style={{ marginBottom: "6px", display: "inline-block" }}>
                    🎛️ Interactive Lab
                  </span>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-main)" }}>
                    The Browser Audio Synth Lab (Zero MP3 Files)
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Click below to test the sound effects synthesized live in this browser with Web Audio oscillators:
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <button
                  onClick={() => sounds.fanfare()}
                  className="btn header-btn"
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    background: "#fff",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  🎺 Play Fanfare
                </button>

                <button
                  onClick={() => sounds.roulette()}
                  className="btn header-btn"
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    background: "#fff",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  🥁 Bakra Roulette Roll
                </button>

                <button
                  onClick={() => sounds.pop()}
                  className="btn header-btn"
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                    background: "#fff",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  🔔 Soft Reveal Pop
                </button>

                <button
                  onClick={() => {
                    sounds.fanfare();
                    triggerGiftRain();
                  }}
                  className="btn btn-black"
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                >
                  🎁 Fire Gift Confetti
                </button>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-muted)", background: "rgba(255,255,255,0.7)", padding: "10px 14px", borderRadius: "8px" }}>
                💡 <strong>Why we built it with math:</strong> Audio files cause lag and playback stuttering on video calls. Himanshu prompted Antigravity to write pure Web Audio API oscillator synthesis—resulting in instant 0ms latency with zero bytes downloaded!
              </div>
            </div>

            {/* The 3 Superpowers */}
            <div style={{ marginBottom: "36px" }}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)" }}>
                  The 3 AI Superpowers in Action
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                  Moving from simple autocomplete to an Autonomous Engineering Unit.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {/* Superpower 1 */}
                <div
                  className="card"
                  style={{
                    padding: "24px",
                    border: "1px solid var(--card-border)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(72,113,197,0.1)",
                      color: "var(--brand-blue)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      marginBottom: "16px",
                    }}
                  >
                    ⚡
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text-main)" }}>
                    1. 10x Product Velocity
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.5, flex: 1 }}>
                    Scaffolding full-stack Next.js 14, Upstash Redis multi-player state, NextAuth Google OAuth, and
                    mobile-responsive UI in under 2 hours without context switching.
                  </p>
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--card-border)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--brand-blue)",
                    }}
                  >
                    Secret Santa: 7:28 PM idea ➔ 9:00 PM Live Production
                  </div>
                </div>

                {/* Superpower 2 */}
                <div
                  className="card"
                  style={{
                    padding: "24px",
                    border: "1px solid var(--card-border)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(188,0,112,0.1)",
                      color: "var(--brand-pink)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      marginBottom: "16px",
                    }}
                  >
                    🛡️
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text-main)" }}>
                    2. Strict Architectural Guardrails
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.5, flex: 1 }}>
                    Never letting code slip through without domain validation. Pre-configured rules (`AGENTS.md`)
                    enforce typed exceptions, zero-PII logging, tenant isolation, and thin controllers automatically.
                  </p>
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--card-border)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--brand-pink)",
                    }}
                  >
                    Zero repeat bugs: Every fix is codified into permanent rules
                  </div>
                </div>

                {/* Superpower 3 */}
                <div
                  className="card"
                  style={{
                    padding: "24px",
                    border: "1px solid var(--card-border)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(16,185,129,0.1)",
                      color: "var(--success)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      marginBottom: "16px",
                    }}
                  >
                    🎭
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--text-main)" }}>
                    3. Maker-Checker Subagents
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.5, flex: 1 }}>
                    Instead of a single AI that blindly agrees with itself, Himanshu uses an adversarial pair: One agent
                    writes the feature, while a dedicated subagent aggressively attacks the diff before PR submission.
                  </p>
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--card-border)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--success)",
                    }}
                  >
                    `carscan-dual-review` catches edge cases before humans review
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE FEATURE 2: Corporate Slog vs Himanshu Matrix */}
            <div className="card" style={{ padding: "32px 24px", marginBottom: "36px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-main)" }}>
                    The Velocity Reality Check
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                    How projects typically happen vs. how Himanshu delivers with AI pairing.
                  </p>
                </div>

                <div style={{ display: "flex", background: "var(--chip-bg)", padding: "3px", borderRadius: "8px" }}>
                  <button
                    onClick={() => setComparisonMode("traditional")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: comparisonMode === "traditional" ? "#fff" : "transparent",
                      color: comparisonMode === "traditional" ? "var(--text-main)" : "var(--text-muted)",
                      boxShadow: comparisonMode === "traditional" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    🏢 The 3-Week Corporate Slog
                  </button>
                  <button
                    onClick={() => setComparisonMode("himanshu")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: comparisonMode === "himanshu" ? "var(--brand-gradient)" : "transparent",
                      color: comparisonMode === "himanshu" ? "#fff" : "var(--text-muted)",
                      boxShadow: comparisonMode === "himanshu" ? "0 2px 6px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    ⚡ Himanshu + Antigravity (1 Evening)
                  </button>
                </div>
              </div>

              {comparisonMode === "traditional" ? (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "14px", padding: "20px" }}>
                  <div style={{ fontWeight: 800, color: "#991B1B", fontSize: "15px", marginBottom: "12px" }}>
                    The Old Way (Estimated Time: 3 to 4 Sprints)
                  </div>
                  <div style={{ display: "grid", gap: "10px", fontSize: "13px", color: "#7F1D1D" }}>
                    <div>• <strong>Sprint Planning:</strong> 2 hours debating ticket points, story estimates, and scope.</div>
                    <div>• <strong>Design Hand-off:</strong> Waiting 5 days for Figma mocks and icon exports.</div>
                    <div>• <strong>Backend & Infrastructure:</strong> Setting up database migrations, auth middleware, and API routes manually.</div>
                    <div>• <strong>PR & Code Review:</strong> 4 rounds of Greptile comments, lint failures, and nitpicks.</div>
                    <div>• <strong>Deployment:</strong> "Blocked by staging freeze. Rescheduled for next release train." 💤</div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "14px", padding: "20px" }}>
                  <div style={{ fontWeight: 800, color: "#166534", fontSize: "15px", marginBottom: "12px" }}>
                    The AI-Native Way (Delivered: Under 2 Hours)
                  </div>
                  <div style={{ display: "grid", gap: "10px", fontSize: "13px", color: "#14532D" }}>
                    <div>• <strong>7:28 PM:</strong> Conceived idea, authenticated personal GitHub, and pushed initial skeleton.</div>
                    <div>• <strong>8:23 PM:</strong> Automated design extraction matching scans.ai branding, tokens, and responsive layout.</div>
                    <div>• <strong>8:42 PM:</strong> Invented & coded "Random Presenter Roulette" server state in minutes.</div>
                    <div>• <strong>8:58 PM:</strong> Added Web Audio frequency oscillators & festive confetti.</div>
                    <div>• <strong>9:00 PM:</strong> 100% deployed and live on Vercel with zero bugs. 🚀</div>
                  </div>
                </div>
              )}
            </div>

            {/* BRANDING SECTION 1: How I Improve Daily */}
            <div
              className="card"
              style={{
                padding: "32px 24px",
                marginBottom: "36px",
                background: "linear-gradient(180deg, #ffffff 0%, rgba(72,113,197,0.03) 100%)",
                border: "1px solid rgba(72,113,197,0.2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <span className="event-badge" style={{ background: "var(--brand-gradient)", color: "#fff", border: "none" }}>
                  📈 Continuous Evolution
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-main)" }}>
                  How I Am Improving Daily (The 1% Compounding Loop)
                </h3>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "16px",
                }}
              >
                <div style={{ background: "var(--chip-bg)", padding: "18px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand-blue)" }}>
                    1. Zero Repeated Mistakes
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                    Whenever a PR review or edge case comes up, I don't just fix it—I run <code>/learn</code> to codify it into <code>AGENTS.md</code> or <code>.greptile/rules.md</code> so my AI co-pilot prevents it permanently.
                  </div>
                </div>

                <div style={{ background: "var(--chip-bg)", padding: "18px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand-pink)" }}>
                    2. Tool Building Over Prompt Tweaking
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                    Instead of repeatedly typing long prompts, I build reusable <strong>Antigravity Skills</strong> (like <code>carscan-fast-test</code> and <code>sqs-pipeline-navigator</code>) that automate entire developer workflows.
                  </div>
                </div>

                <div style={{ background: "var(--chip-bg)", padding: "18px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--success)" }}>
                    3. Tracking My AI Velocity Ledger
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                    I track daily diffs, hours saved, and subagent review accuracy. This constant measurement pushes me to move from Level 1 assistance to Level 4 autonomous orchestration.
                  </div>
                </div>
              </div>
            </div>

            {/* BRANDING SECTION 2: How Others (The Team) Can Do It Too */}
            <div
              className="card"
              style={{
                padding: "32px 24px",
                marginBottom: "36px",
                border: "2px solid rgba(188,0,112,0.2)",
                background: "linear-gradient(135deg, rgba(72,113,197,0.05) 0%, rgba(188,0,112,0.05) 100%, #ffffff 100%)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <span className="event-badge" style={{ marginBottom: "8px", display: "inline-block" }}>
                  🚀 The Team Playbook
                </span>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)" }}>
                  How YOU Can Do It Too: 3 Steps to 10x Velocity
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "600px", margin: "4px auto 0" }}>
                  AI isn't about replacing engineers—it's about removing cognitive friction so we can build bigger, bolder, and faster.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--chip-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--brand-blue)" }}>
                    01
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-main)" }}>
                      Stop Asking Questions — Start Providing Deep Architecture Context
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Don't treat AI like Google search. Feed it your repository conventions, typed exceptions, and database models. Let it know the exact boundaries before asking it to write a single method.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--chip-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--brand-pink)" }}>
                    02
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-main)" }}>
                      Automate Your Single Most Annoying Task First
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Hate writing Mockito assertions? Hate tracing SQS consumer queues? Build a single focused script or skill that does it in 5 seconds. Once you win that back, expand to the next workflow.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--chip-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--success)" }}>
                    03
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-main)" }}>
                      Never Trust Single-Shot Code: Use Maker-Checker Subagents
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Always spin up a secondary adversarial agent whose only job is to find what the first agent missed. This catches null pointers, missed tenant filters, and edge cases before PR review.
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Connect Callout */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "20px",
                  borderRadius: "14px",
                  border: "1px solid rgba(72,113,197,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <img
                    src="https://github.com/himanshujainpro.png"
                    alt="Himanshu"
                    style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px solid var(--brand-pink)" }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-main)" }}>
                      Want to set up AI pairing for your service?
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Ping Himanshu on Slack or GitHub—happy to run a hands-on pairing session with anyone on the team!
                    </div>
                  </div>
                </div>
                <a
                  href="https://github.com/himanshujainpro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-black btn-sm"
                  style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  Connect on GitHub ↗
                </a>
              </div>
            </div>

            {/* INTERACTIVE FEATURE 3: Live Redis Reaction Counter */}
            <div
              className="card"
              style={{
                padding: "28px 24px",
                marginBottom: "36px",
                textAlign: "center",
                border: "1px solid var(--card-border)",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main)", marginBottom: "6px" }}>
                Drop a Live Reaction for Fun Friday! 🎉
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                Tap an emoji below to add your live reaction (synced across the team via Upstash Redis):
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => handleReaction("blown")}
                  disabled={userReacted.blown}
                  className="btn"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "100px",
                    border: userReacted.blown ? "2px solid var(--brand-blue)" : "1px solid var(--card-border)",
                    background: userReacted.blown ? "rgba(72,113,197,0.1)" : "#fff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>🤯 Mind Blown</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--chip-bg)", padding: "2px 8px", borderRadius: "10px" }}>
                    {reactions.blown}
                  </span>
                </button>

                <button
                  onClick={() => handleReaction("speed")}
                  disabled={userReacted.speed}
                  className="btn"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "100px",
                    border: userReacted.speed ? "2px solid var(--brand-pink)" : "1px solid var(--card-border)",
                    background: userReacted.speed ? "rgba(188,0,112,0.1)" : "#fff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>🚀 10x Speed</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--chip-bg)", padding: "2px 8px", borderRadius: "10px" }}>
                    {reactions.speed}
                  </span>
                </button>

                <button
                  onClick={() => handleReaction("banter")}
                  disabled={userReacted.banter}
                  className="btn"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "100px",
                    border: userReacted.banter ? "2px solid var(--warning)" : "1px solid var(--card-border)",
                    background: userReacted.banter ? "rgba(245,158,11,0.1)" : "#fff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>🔥 Pure Banter</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--chip-bg)", padding: "2px 8px", borderRadius: "10px" }}>
                    {reactions.banter}
                  </span>
                </button>

                <button
                  onClick={() => handleReaction("op")}
                  disabled={userReacted.op}
                  className="btn"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "100px",
                    border: userReacted.op ? "2px solid var(--success)" : "1px solid var(--card-border)",
                    background: userReacted.op ? "rgba(16,185,129,0.1)" : "#fff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>👏 Himanshu OP</span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--chip-bg)", padding: "2px 8px", borderRadius: "10px" }}>
                    {reactions.op}
                  </span>
                </button>
              </div>
            </div>

            {/* INTERACTIVE FEATURE 4: THE BADGE CLAIM FINALE */}
            <div
              className="card"
              style={{
                padding: "36px 24px",
                marginBottom: "36px",
                textAlign: "center",
                border: "2px solid var(--brand-pink)",
                background: "linear-gradient(135deg, rgba(72,113,197,0.08) 0%, rgba(188,0,112,0.12) 100%, #ffffff 100%)",
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>
                {claimedBadge ? "🎉" : "🎁"}
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px" }}>
                {claimedBadge ? "You Unlocked the [⚡ AI Insider] Badge!" : "Claim Your Official [⚡ AI Insider] Badge!"}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "540px", margin: "0 auto 24px" }}>
                {claimedBadge
                  ? "Your badge is officially active in the Secret Santa room! Everyone in the lobby can see you've mastered the AI engineering story."
                  : "Finish the showcase by claiming your badge. It will appear right next to your name in the game lobby for the entire team to see!"}
              </p>

              {claimedBadge ? (
                <div style={{ display: "inline-flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                  <div
                    style={{
                      padding: "8px 20px",
                      borderRadius: "100px",
                      background: "var(--brand-gradient)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "14px",
                      boxShadow: "0 4px 14px rgba(188,0,112,0.3)",
                    }}
                  >
                    ⚡ Verified AI Insider
                  </div>
                  <Link
                    href="/"
                    className="btn btn-black btn-lg"
                    style={{ textDecoration: "none", marginTop: "8px" }}
                  >
                    Return to Game Room with Badge ➔
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleClaimBadge}
                  disabled={claiming}
                  className="btn btn-black btn-lg"
                  style={{
                    padding: "16px 36px",
                    fontSize: "16px",
                    fontWeight: 800,
                    background: "var(--brand-gradient)",
                    border: "none",
                    boxShadow: "0 6px 20px rgba(188,0,112,0.35)",
                  }}
                >
                  {claiming ? "Activating Badge..." : "🎁 Claim My [⚡ AI Insider] Badge & Fireworks"}
                </button>
              )}
            </div>

            {/* Bottom Call to Action for Detailed Version */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(72,113,197,0.1) 0%, rgba(188,0,112,0.1) 100%)",
                borderRadius: "16px",
                padding: "32px 24px",
                border: "1px solid rgba(72,113,197,0.2)",
                textAlign: "center",
              }}
            >
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-main)", marginBottom: "8px" }}>
                Curious About the Technical Architecture?
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "600px", margin: "0 auto 20px" }}>
                Discover how Antigravity enforces Spring Boot microservice boundaries, executes scoped JUnit 5 test runs in seconds, and navigates SQS event-driven pipelines.
              </p>
              <button
                onClick={() => setActiveTab("deep")}
                className="btn btn-black btn-md"
                style={{ padding: "12px 28px", fontSize: "14px", fontWeight: 700 }}
              >
                Explore the Technical Deep-Dive ➔
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
             VERSION 2: DETAILED TECHNICAL DEEP-DIVE
             ========================================================================= */
          <div>
            {/* Navigation Pills for Deep Dive Subsections */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "28px",
                overflowX: "auto",
                paddingBottom: "4px",
              }}
            >
              <button
                onClick={() => setDeepSection("secret-santa")}
                className={`header-btn ${deepSection === "secret-santa" ? "btn-black" : ""}`}
                style={{
                  background: deepSection === "secret-santa" ? "var(--primary-black)" : "#fff",
                  color: deepSection === "secret-santa" ? "#fff" : "var(--text-main)",
                  fontWeight: 600,
                  fontSize: "13px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                }}
              >
                1. Secret Santa Tech Stack
              </button>

              <button
                onClick={() => setDeepSection("carscan")}
                className={`header-btn ${deepSection === "carscan" ? "btn-black" : ""}`}
                style={{
                  background: deepSection === "carscan" ? "var(--primary-black)" : "#fff",
                  color: deepSection === "carscan" ? "#fff" : "var(--text-main)",
                  fontWeight: 600,
                  fontSize: "13px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                }}
              >
                2. CarScan Backend AI Arsenal
              </button>

              <button
                onClick={() => setDeepSection("maturity")}
                className={`header-btn ${deepSection === "maturity" ? "btn-black" : ""}`}
                style={{
                  background: deepSection === "maturity" ? "var(--primary-black)" : "#fff",
                  color: deepSection === "maturity" ? "#fff" : "var(--text-main)",
                  fontWeight: 600,
                  fontSize: "13px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                }}
              >
                3. The 5-Level AI Maturity Model
              </button>

              <button
                onClick={() => setDeepSection("playbook")}
                className={`header-btn ${deepSection === "playbook" ? "btn-black" : ""}`}
                style={{
                  background: deepSection === "playbook" ? "var(--primary-black)" : "#fff",
                  color: deepSection === "playbook" ? "#fff" : "var(--text-main)",
                  fontWeight: 600,
                  fontSize: "13px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                }}
              >
                4. Himanshu's Team AI Playbook
              </button>
            </div>

            {/* Subsection 1: Secret Santa Tech Stack */}
            {deepSection === "secret-santa" && (
              <div className="card" style={{ padding: "32px 24px" }}>
                <span className="event-badge" style={{ marginBottom: "12px", display: "inline-block" }}>
                  Case Study #1
                </span>
                <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>
                  Anatomy of the Secret Santa App
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
                  How a complex real-time game with voting, presenter roulette, and state synchronization was engineered in hours.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "16px",
                    marginBottom: "28px",
                  }}
                >
                  <div style={{ background: "var(--chip-bg)", padding: "16px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-blue)" }}>FRAMEWORK</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>Next.js 14 (App Router)</div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Serverless endpoints + Client components with automatic hydration.
                    </div>
                  </div>

                  <div style={{ background: "var(--chip-bg)", padding: "16px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand-pink)" }}>DATA STORE</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>Upstash Redis (Serverless)</div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Zero-infrastructure in-memory store for instantaneous multi-client room sync.
                    </div>
                  </div>

                  <div style={{ background: "var(--chip-bg)", padding: "16px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--success)" }}>AUTHENTICATION</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>NextAuth.js (Google OAuth)</div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Real colleague identity verification while preserving 100% pitch anonymity.
                    </div>
                  </div>

                  <div style={{ background: "var(--chip-bg)", padding: "16px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#8B5CF6" }}>MULTIMEDIA</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>Web Audio API & Confetti</div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                      Zero external audio assets; dynamically generated sound wave synthesis.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--primary-black)",
                    color: "#F8FAFC",
                    padding: "20px",
                    borderRadius: "12px",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ color: "#94A3B8", marginBottom: "8px" }}>// The Autonomous Prompting Flow (fa958e09)</div>
                  <div>1. "need to deploy this from personal github" ➔ Automated git remote configuration</div>
                  <div>2. "make ui same as scans.ai and branding" ➔ Tokenized design tokens & CSS extraction</div>
                  <div>3. "random colleague to speak instead of writer" ➔ Server-side Bakra roulette algorithm</div>
                  <div>4. "add sound or animation rain effect" ➔ Web Audio synthesizer oscillators & Canvas rain</div>
                </div>
              </div>
            )}

            {/* Subsection 2: CarScan Backend AI Arsenal */}
            {deepSection === "carscan" && (
              <div className="card" style={{ padding: "32px 24px" }}>
                <span className="event-badge" style={{ marginBottom: "12px", display: "inline-block" }}>
                  Enterprise Engineering
                </span>
                <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>
                  CarScan Backend Microservices Co-Pilot
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
                  How Himanshu leverages custom Antigravity skills, knowledge graph MCP, and strict architectural guardrails.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Skill 1 */}
                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      border: "1px solid var(--card-border)",
                      background: "#fff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-main)" }}>
                        `carscan-code-guard`
                      </div>
                      <span className="event-badge" style={{ fontSize: "11px" }}>Guardrail Enforcer</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                      Enforces CarScan backend architectural standards: Typed exceptions (`BusinessValidationError`, `ApplicationException`), zero-PII logging, tenant isolation, and thin controller SRP.
                    </p>
                  </div>

                  {/* Skill 2 */}
                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      border: "1px solid var(--card-border)",
                      background: "#fff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--brand-pink)" }}>
                        `carscan-dual-review`
                      </div>
                      <span className="event-badge" style={{ fontSize: "11px", color: "var(--brand-pink)" }}>
                        Adversarial Reviewer
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                      Orchestrates a maker-checker review using an adversarial subagent to critique branch diffs against `AGENTS.md` and `.greptile/rules.md` before creating GitHub PRs.
                    </p>
                  </div>

                  {/* Skill 3 */}
                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      border: "1px solid var(--card-border)",
                      background: "#fff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--brand-blue)" }}>
                        `carscan-fast-test` & `carscan-junit-scaffold`
                      </div>
                      <span className="event-badge" style={{ fontSize: "11px", color: "var(--brand-blue)" }}>
                        High-Velocity TDD
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                      Runs single JUnit tests, test classes, or modified test files in seconds without noisy Maven logs or full build overhead. Scaffolds MockMvc and Mockito tests instantly.
                    </p>
                  </div>

                  {/* Skill 4 */}
                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      border: "1px solid var(--card-border)",
                      background: "#fff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--success)" }}>
                        `sqs-pipeline-navigator` & `code-review-graph` MCP
                      </div>
                      <span className="event-badge" style={{ fontSize: "11px", color: "var(--success)" }}>
                        AST Knowledge Graph
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                      Maps producers, consumers, and data sync flows across microservices. MCP structural graph computes blast radius and caller hierarchies before any refactor is touched.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Subsection 3: AI Maturity Model */}
            {deepSection === "maturity" && (
              <div className="card" style={{ padding: "32px 24px" }}>
                <span className="event-badge" style={{ marginBottom: "12px", display: "inline-block" }}>
                  Strategic Roadmap
                </span>
                <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>
                  The 5-Level AI Engineering Maturity Model
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
                  Where the software industry stands vs. how Himanshu operates with Antigravity.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ padding: "16px", borderRadius: "10px", background: "var(--chip-bg)", opacity: 0.6 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700 }}>LEVEL 1: Syntax Autocomplete & Chat</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Asking conversational questions or accepting tab-completions. <em>(Where 80% of developers stay)</em></div>
                  </div>

                  <div style={{ padding: "16px", borderRadius: "10px", background: "var(--chip-bg)", opacity: 0.75 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700 }}>LEVEL 2: Context-Aware Workspace Agent</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Reading local files and editing code blocks directly in IDE.</div>
                  </div>

                  <div style={{ padding: "16px", borderRadius: "10px", background: "var(--chip-bg)", opacity: 0.9 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700 }}>LEVEL 3: Custom Domain Skills & Knowledge Graph</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Codifying repository rules, AST graphs, and microservice workflows into tailored toolkits.</div>
                  </div>

                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, rgba(72,113,197,0.1) 0%, rgba(188,0,112,0.1) 100%)",
                      border: "2px solid var(--brand-pink)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-main)" }}>
                        LEVEL 4: Autonomous Maker-Checker Duo (HIMANSHU & ANTIGRAVITY TODAY)
                      </div>
                      <span className="event-badge" style={{ background: "var(--brand-pink)", color: "#fff", border: "none" }}>
                        CURRENT BENCHMARK
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                      Adversarial subagents, targeted test verification, zero-repeat bug protocols (`/learn`), and rapid production shipping.
                    </div>
                  </div>

                  <div style={{ padding: "16px", borderRadius: "10px", background: "var(--chip-bg)" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand-blue)" }}>
                      LEVEL 5: Self-Evolving Multi-Agent Swarms
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Fully parallelized swarms executing end-to-end multi-service refactors with zero human verification friction.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subsection 4: Himanshu's Team AI Playbook */}
            {deepSection === "playbook" && (
              <div className="card" style={{ padding: "32px 24px" }}>
                <span className="event-badge" style={{ marginBottom: "12px", display: "inline-block" }}>
                  Engineering Culture
                </span>
                <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>
                  Himanshu's AI Playbook: How the Whole Team Wins
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
                  The exact daily routine and operational principles to turn AI into a permanent engineering multiplier.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ background: "var(--chip-bg)", padding: "20px", borderRadius: "12px" }}>
                    <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--brand-blue)", marginBottom: "8px" }}>
                      1. The Daily Operational Routine
                    </div>
                    <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.8 }}>
                      <li><strong>Morning Kickoff:</strong> Scope requirements, trace dependencies using the knowledge graph, and define testing gates.</li>
                      <li><strong>Scaffolding & Execution:</strong> Use domain skills (`carscan-junit-scaffold`) to generate strictly typed implementations adhering to `AGENTS.md`.</li>
                      <li><strong>Pre-Flight Review:</strong> Run `carscan-dual-review`—an adversarial agent audits the diff before opening a pull request.</li>
                      <li><strong>End-of-Day Compounding:</strong> Run `/learn` on any unexpected gotchas to turn them into permanent repository rules.</li>
                    </ul>
                  </div>

                  <div style={{ background: "var(--chip-bg)", padding: "20px", borderRadius: "12px" }}>
                    <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--brand-pink)", marginBottom: "8px" }}>
                      2. Principles of an AI-Native Engineer
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.7 }}>
                      • <strong>Architect First:</strong> AI doesn't know your business domain or architectural boundaries unless you define them.<br />
                      • <strong>Deterministic Gates:</strong> Never trust vibes. Always back AI-generated code with automated unit tests and fast test suites.<br />
                      • <strong>Share the Tools:</strong> Every custom script or prompt pattern should be converted into a shared team skill.
                    </div>
                  </div>

                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(72,113,197,0.12) 0%, rgba(188,0,112,0.12) 100%)",
                      padding: "24px",
                      borderRadius: "14px",
                      border: "1px solid rgba(188,0,112,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-main)" }}>
                        Let's Pair Up!
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                        I'm hosting pairing sessions for anyone on the team who wants to set up Antigravity, custom skills, or automated testing. Reach out anytime!
                      </div>
                    </div>
                    <a
                      href="https://github.com/himanshujainpro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-black btn-md"
                      style={{ textDecoration: "none", whiteSpace: "nowrap" }}
                    >
                      Connect with Himanshu ↗
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "24px 0",
          textAlign: "center",
          borderTop: "1px solid var(--card-border)",
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
          <img
            src="https://github.com/himanshujainpro.png"
            alt="Himanshu"
            style={{ width: "20px", height: "20px", borderRadius: "50%" }}
          />
          <span>
            Crafted for <strong>Fun Friday</strong> by <strong>Himanshu Jain</strong> with{" "}
            <strong style={{ color: "var(--brand-pink)" }}>Antigravity AI</strong> •{" "}
            <Link href="/" style={{ color: "var(--brand-blue)", textDecoration: "none", fontWeight: 600 }}>
              Play Secret Santa 🎁
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
