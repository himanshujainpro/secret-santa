"use client";
import React, { useState, useMemo } from "react";
import { SCANS_TEAM, SQUAD_INFO } from "@/lib/team";

export default function TeamRosterSidebar({ chiefGuest, isOpen, onClose }) {
  const isCgRevealed = !!chiefGuest?.revealed;
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'Mobile Pod' | 'Backend & Engineering Pod' | 'Quality Engineering Pod' | 'Product & Design Pod'

  // Flatten all 17 members and sort alphabetically by first name for 100% equal standing
  const allMembers = useMemo(() => {
    const list = SCANS_TEAM.flatMap((group) =>
      group.members.map((m) => ({
        ...m,
        podName: group.category,
        podIcon: group.categoryIcon,
      }))
    );
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filter members based on selected tab
  const displayedMembers = useMemo(() => {
    if (activeFilter === "all") return allMembers;
    return allMembers.filter((m) => m.podName === activeFilter);
  }, [allMembers, activeFilter]);

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

      {/* VIP Chief Guest of Honour Feature Card - ONLY visible once officially revealed */}
      {isCgRevealed && (
        <div className="sidebar-cg-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <span className="sidebar-cg-badge">👑 CHIEF GUEST OF HONOUR</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#10B981" }}>
              ● REVEALED
            </span>
          </div>

          <div className="sidebar-cg-row">
            {chiefGuest?.photoUrl ? (
              <img
                src={chiefGuest.photoUrl}
                alt={chiefGuest.name || "Chief Guest"}
                className="sidebar-cg-photo"
              />
            ) : (
              <div className="sidebar-cg-avatar">
                👑
              </div>
            )}

            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sidebar-cg-name">
                {chiefGuest.name}
              </div>
              <div className="sidebar-cg-title">
                {chiefGuest.title || "Founder & CEO"}
              </div>
            </div>
          </div>

          <div className="sidebar-cg-status">
            <span>✨ Officially revealed with royal ribbon cutting fanfare!</span>
          </div>
        </div>
      )}

      {/* Squad Branding Header: Ride Hailing Squad - The Heart of Scans.ai */}
      <div className="team-branding-box">
        <div className="team-branding-title">
          <span>🚕</span> {SQUAD_INFO.name.toUpperCase()} ({SQUAD_INFO.memberCount})
        </div>
        <p className="team-branding-subtitle">
          <strong>{SQUAD_INFO.tagline}</strong> • 17 United Superstars powering the core Ride Hailing inspection engine!
        </p>
        <div style={{ fontSize: "11px", color: "var(--brand-blue)", fontWeight: 700, marginTop: "4px" }}>
          ⭐ 100% Equal Standing • Alphabetical Order
        </div>
      </div>

      {/* Pod Filter Tabs: Equal Prominence for All 4 Pods */}
      <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "6px", marginBottom: "10px" }}>
        <button
          onClick={() => setActiveFilter("all")}
          className={`btn btn-sm ${activeFilter === "all" ? "btn-gradient" : "btn-outline"}`}
          style={{ fontSize: "11px", padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0 }}
        >
          🌟 All 17
        </button>
        {SCANS_TEAM.map((group) => (
          <button
            key={group.category}
            onClick={() => setActiveFilter(group.category)}
            className={`btn btn-sm ${activeFilter === group.category ? "btn-gradient" : "btn-outline"}`}
            style={{ fontSize: "11px", padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {group.categoryIcon} {group.category.replace(" Pod", "")}
          </button>
        ))}
      </div>

      {/* Unified Alphabetical Team List */}
      <div className="team-group-card" style={{ marginBottom: "8px" }}>
        <div className="team-group-header" style={{ justifyContent: "space-between" }}>
          <span>
            {activeFilter === "all" ? "🌟 United Squad Roster" : activeFilter}
          </span>
          <span style={{ fontSize: "11px", fontWeight: 700, opacity: 0.8 }}>
            {displayedMembers.length} Members
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {displayedMembers.map((member) => (
            <div key={member.id} className="team-member-row">
              <div
                className="team-member-avatar-badge"
                style={{ background: member.gradient }}
              >
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  member.initials
                )}
              </div>

              <div className="team-member-details">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                  <span className="team-member-name-text">
                    {member.name}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>
                    {member.podIcon}
                  </span>
                </div>

                <div className="team-member-sub-row" style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                  <span className="team-member-role-badge">
                    {member.badge}
                  </span>
                  {member.email && (
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {member.email}
                    </span>
                  )}
                  {member.cockpitUrl && (
                    <a
                      href={member.cockpitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{
                        fontSize: "9px",
                        padding: "1px 7px",
                        borderRadius: "100px",
                        color: "var(--brand-pink)",
                        borderColor: "rgba(188, 0, 112, 0.4)",
                        textDecoration: "none",
                        fontWeight: 700,
                        marginLeft: "auto",
                      }}
                    >
                      🚀 Dev Cockpit ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
