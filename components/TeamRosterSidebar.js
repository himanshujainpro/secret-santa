"use client";
import React from "react";
import { SCANS_TEAM, SQUAD_INFO } from "@/lib/team";

export default function TeamRosterSidebar({ chiefGuest, isOpen, onClose }) {
  const isCgRevealed = !!chiefGuest?.revealed;

  return (
    <aside className={`team-roster-sidebar ${isOpen ? "is-mobile-open" : ""}`} id="team-roster">
      {/* Mobile Close Button */}
      {onClose && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ fontSize: "12px", padding: "4px 10px" }}
          >
            ✕ Close Squad Panel
          </button>
        </div>
      )}

      {/* VIP Chief Guest of Honour Feature Card */}
      <div className="sidebar-cg-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <span className="sidebar-cg-badge">👑 CHIEF GUEST OF HONOUR</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: isCgRevealed ? "#10B981" : "#F59E0B" }}>
            {isCgRevealed ? "● REVEALED" : "● TOP SECRET"}
          </span>
        </div>

        <div className="sidebar-cg-row">
          {isCgRevealed && chiefGuest?.photoUrl ? (
            <img
              src={chiefGuest.photoUrl}
              alt={chiefGuest.name || "Chief Guest"}
              className="sidebar-cg-photo"
            />
          ) : (
            <div className="sidebar-cg-avatar">
              {isCgRevealed ? "👑" : "🔒"}
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sidebar-cg-name">
              {isCgRevealed ? chiefGuest.name : "Top Secret VIP Guest"}
            </div>
            <div className="sidebar-cg-title">
              {isCgRevealed ? (chiefGuest.title || "Founder & CEO") : "Ribbon Cutting Ceremony"}
            </div>
          </div>
        </div>

        <div className="sidebar-cg-status">
          {isCgRevealed ? (
            <span>✨ Officially revealed with royal fanfare!</span>
          ) : (
            <span>🤫 Identity stays 100% secret until the ribbon is cut!</span>
          )}
        </div>
      </div>

      {/* Squad Branding Header: Ride Hailing Squad - The Heart of Scans.ai */}
      <div className="team-branding-box">
        <div className="team-branding-title">
          <span>🚕</span> {SQUAD_INFO.name.toUpperCase()} ({SQUAD_INFO.memberCount})
        </div>
        <p className="team-branding-subtitle">
          <strong>{SQUAD_INFO.tagline}</strong> • 17 United Superstars powering the core Ride Hailing inspection engine!
        </p>
      </div>

      {/* Equal Pods Across Mobile, Backend, QA, and Design */}
      {SCANS_TEAM.map((group) => (
        <div key={group.category} className="team-group-card">
          <div className="team-group-header">
            <span>{group.categoryIcon}</span>
            <span>{group.category}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {group.members.map((member) => (
              <div key={member.id} className="team-member-row">
                <div
                  className="team-member-avatar-badge"
                  style={{ background: member.gradient }}
                >
                  {member.initials}
                </div>

                <div className="team-member-details">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                    <span className="team-member-name-text">
                      {member.name}
                    </span>
                  </div>

                  <div className="team-member-sub-row">
                    <span className="team-member-role-badge">
                      {member.badge}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
