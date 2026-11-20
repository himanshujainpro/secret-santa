"use client";
import React, { useState } from "react";
import Link from "next/link";
import { COCKPIT_URL } from "@/lib/team";

export default function CockpitPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(COCKPIT_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-canvas)", color: "var(--text-main)" }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: "1px solid var(--card-border)",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: "12px 24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <img src="/scans-logo.svg" alt="Scans.ai" style={{ height: "24px", width: "auto" }} />
            </Link>
            <span style={{ height: "18px", width: "1px", background: "var(--card-border)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, fontFamily: "Sora, sans-serif", color: "var(--brand-blue)" }}>
                DEVELOPER COCKPIT
              </span>
              <span className="live-pill" style={{ fontSize: "10px", padding: "1px 6px" }}>
                LIVE S3
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href="/" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
              🎁 Secret Santa
            </Link>
            <Link href="/ai" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
              ⚡ AI Architecture
            </Link>
            <a
              href={COCKPIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gradient btn-sm"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span>🚀</span>
              <span>Open in New Tab ↗</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px", flex: 1, width: "100%" }}>
        {/* Hero Card */}
        <div
          className="card"
          style={{
            padding: "32px 28px",
            marginBottom: "24px",
            background: "linear-gradient(135deg, #ffffff 0%, rgba(72, 113, 197, 0.05) 50%, rgba(188, 0, 112, 0.03) 100%)",
            border: "1.5px solid rgba(72, 113, 197, 0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #4871C5, #BC0070)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  boxShadow: "0 6px 18px rgba(72, 113, 197, 0.3)",
                }}
              >
                🚀
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "24px", fontWeight: 800, fontFamily: "Sora, sans-serif", margin: 0, color: "var(--text-main)" }}>
                    Himanshu Jain · Live Developer Cockpit
                  </h1>
                  <span className="live-pill" style={{ fontSize: "10px" }}>
                    ● S3 ACTIVE
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Radically Transparent Real-Time Developer Observability Platform • Powered by Antigravity Lifecycle Hooks &amp; AWS S3
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={handleCopy} className="btn btn-outline btn-sm">
                {copied ? "✅ Copied Direct S3 URL!" : "📋 Copy S3 Link"}
              </button>
              <a
                href={COCKPIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gradient btn-sm"
                style={{ textDecoration: "none" }}
              >
                🚀 Launch Fullscreen Cockpit ↗
              </a>
            </div>
          </div>

          {/* Highlights Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid var(--card-border)",
            }}
          >
            <div style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--brand-blue)", textTransform: "uppercase" }}>
                ⚡ Real-Time Telemetry
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Native hooks capture active files, terminal commands, and AI reasoning phases without human intervention.
              </div>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--brand-pink)", textTransform: "uppercase" }}>
                ⏱️ Chronological Timeline
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                3-stage structured view: <strong>Yesterday</strong> achievements, <strong>Today</strong> live sprint items, and <strong>Planned</strong> ClickUp backlog.
              </div>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--success)", textTransform: "uppercase" }}>
                ☁️ AWS S3 Cloud Hosting
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                High-availability cloud artifact streaming live state updates to team leads and stakeholders across the company.
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Frame Preview */}
        <div
          className="card"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid var(--card-border)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
            background: "#fff",
          }}
        >
          <div
            style={{
              padding: "12px 18px",
              background: "#F8FAFC",
              borderBottom: "1px solid var(--card-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F59E0B" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10B981" }} />
              <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--text-muted)", marginLeft: "8px" }}>
                s3://devops-s3-artifacts/dev-status/himanshu/index.html
              </span>
            </div>

            <a
              href={COCKPIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "11px", color: "var(--brand-blue)", textDecoration: "none", fontWeight: 600 }}
            >
              Open Fullscreen ↗
            </a>
          </div>

          <div style={{ width: "100%", height: "780px", position: "relative" }}>
            <iframe
              src={COCKPIT_URL}
              title="Himanshu Jain Live Developer Cockpit"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ marginTop: "auto", padding: "20px 0", textAlign: "center", borderTop: "1px solid var(--card-border)", background: "#fff" }}>
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
            Crafted for <strong>Fun Friday</strong> by <strong>Himanshu Jain</strong> with <strong>Antigravity AI</strong> •{" "}
            <Link href="/" style={{ color: "var(--brand-blue)", textDecoration: "none", fontWeight: 600 }}>
              Play Secret Santa 🎁
            </Link>{" • "}
            <Link href="/ai" style={{ color: "var(--brand-pink)", textDecoration: "none", fontWeight: 600 }}>
              See How It Was Built ↗
            </Link>{" • "}
            <a
              href="https://github.com/himanshujainpro"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--brand-blue)", textDecoration: "none", fontWeight: 600 }}
            >
              GitHub ↗
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
