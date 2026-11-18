"use client";
import { useState } from "react";
import Link from "next/link";

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

            {/* The Live Evolution Log (From conversation fa958e09) */}
            <div className="card" style={{ padding: "32px 24px", marginBottom: "36px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-main)" }}>
                    The Secret Santa Live Evolution
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                    How this very game evolved from prompt to deployment on Nov 17.
                  </p>
                </div>
                <span className="event-badge" style={{ background: "var(--chip-bg)", color: "var(--text-main)" }}>
                  fa958e09...
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Step 1 */}
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "var(--chip-bg)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--brand-blue)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    19:28
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                      Initial Idea & Personal GitHub Setup
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Himanshu initiated the project for Fun Friday. Antigravity routed git remotes and configured Vercel edge deployment.
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "var(--chip-bg)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--brand-blue)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    20:23
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                      Scans.ai Brand Makeover
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      "Make UI same as scans.ai and branding also" ➔ Complete design overhaul with Scans gradient, Inter + Sora typography, and polished UI cards.
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "var(--chip-bg)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--brand-pink)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    20:42
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                      The "Random Presenter" Twist (The Bakra Mechanic)
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Himanshu’s brainstorm: <em>"Instead of the gift writer pitching, let's select a random colleague live on call to pitch it!"</em> Antigravity restructured state & added live presenter roulette in minutes.
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "var(--chip-bg)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--success)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    20:58
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                      Festive Gift Rain & Web Audio Synth Sound FX
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Synthesized fanfare, drumrolls, reveal sound chimes, and falling confetti animation injected directly into the browser.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BRANDING SECTION 1: How I Improve Daily & The Compounding Flywheel */}
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
