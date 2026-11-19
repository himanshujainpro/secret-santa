"use client";
import React, { useState, useEffect } from "react";
import { SCANS_TEAM, SQUAD_INFO } from "@/lib/team";
import { sounds } from "@/lib/effects";

export default function RotatingSquadSquare() {
  // Flatten all 17 squad members
  const members = React.useMemo(() => {
    return SCANS_TEAM.flatMap((group) =>
      group.members.map((m) => ({
        ...m,
        podName: group.category,
        podIcon: group.categoryIcon,
      }))
    );
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [flipDegree, setFlipDegree] = useState(0);

  // Auto-rotate the central square spotlight every 2.8 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setFlipDegree((prev) => prev + 360);
      setActiveIndex((prev) => (prev + 1) % members.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPaused, members.length]);

  const current = members[activeIndex] || members[0];

  const handlePrev = () => {
    sounds.pop();
    setFlipDegree((prev) => prev - 360);
    setActiveIndex((prev) => (prev - 1 + members.length) % members.length);
  };

  const handleNext = () => {
    sounds.pop();
    setFlipDegree((prev) => prev + 360);
    setActiveIndex((prev) => (prev + 1) % members.length);
  };

  const handleSelectMember = (idx) => {
    sounds.pop();
    setFlipDegree((prev) => prev + 360);
    setActiveIndex(idx);
  };

  // Duplicated track for seamless infinite horizontal scroll marquee
  const marqueeList = [...members, ...members];

  return (
    <div className="rotating-squad-container">
      {/* Squad Spotlight Header */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div className="squad-spotlight-pill">
          <span>🚕</span>
          <span>{SQUAD_INFO.name.toUpperCase()} SPOTLIGHT</span>
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: 800, fontFamily: "Sora, sans-serif", margin: "6px 0 2px" }}>
          Rotating Squad Square 🔄
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
          {SQUAD_INFO.tagline} • All 17 team stars rotating together!
        </p>
      </div>

      {/* The Central Rotating 3D Square Card */}
      <div
        className="rotating-square-stage"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="rotating-square-card"
          style={{
            transform: `rotateY(${flipDegree}deg)`,
            transition: "transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Card Top Pill: Pod Name */}
          <div className="square-pod-tag">
            <span>{current.podIcon}</span>
            <span>{current.podName}</span>
          </div>

          {/* Member Avatar */}
          <div
            className="square-avatar-circle"
            style={{ background: current.gradient }}
          >
            {current.avatar ? (
              <img
                src={current.avatar}
                alt={current.name}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              current.initials
            )}
          </div>

          {/* Member Name */}
          <div className="square-member-name">
            {current.name}
          </div>

          {/* Role Badge */}
          <div className="square-role-badge">
            {current.badge}
          </div>

          {/* Specialty Highlight */}
          <div className="square-highlight-text">
            &ldquo;{current.highlight}&rdquo;
          </div>

          {/* Member Index Counter */}
          <div className="square-counter-text">
            Member {activeIndex + 1} of {members.length}
          </div>
        </div>
      </div>

      {/* Manual Navigation Controls */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", margin: "14px 0" }}>
        <button
          onClick={handlePrev}
          className="btn btn-outline btn-sm"
          style={{ width: "32px", height: "32px", padding: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
          title="Previous Teammate"
        >
          ◀
        </button>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="btn btn-outline btn-sm"
          style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "100px", color: isPaused ? "#E11D48" : "var(--text-muted)" }}
        >
          {isPaused ? "▶ Resume Rotation" : "⏸ Pause"}
        </button>

        <button
          onClick={handleNext}
          className="btn btn-outline btn-sm"
          style={{ width: "32px", height: "32px", padding: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
          title="Next Teammate"
        >
          ▶
        </button>
      </div>

      {/* Endless Rotating Square Marquee Strip of All 17 Members */}
      <div className="squad-square-marquee-wrapper">
        <div className="squad-square-marquee-track">
          {marqueeList.map((m, idx) => {
            const isCurrent = (idx % members.length) === activeIndex;
            return (
              <div
                key={`${m.id}-${idx}`}
                className={`squad-marquee-square ${isCurrent ? "is-active" : ""}`}
                onClick={() => handleSelectMember(idx % members.length)}
                title={`Click to spotlight ${m.name}`}
              >
                <div
                  className="marquee-square-avatar"
                  style={{ background: m.gradient }}
                >
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt={m.name}
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    m.initials
                  )}
                </div>
                <div className="marquee-square-name">{m.name}</div>
                <div className="marquee-square-role">{m.role}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
