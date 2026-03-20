"use client";

import { useState, useEffect, useCallback } from "react";

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  activity: string;
  avatarBg: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Priya Sharma",
    initials: "PS",
    color: "#818cf8",
    activity: "Analyzing alert",
    avatarBg: "linear-gradient(135deg, #818cf8, #6366f1)",
  },
  {
    id: "2",
    name: "Alex Chen",
    initials: "AC",
    color: "#34d399",
    activity: "Generating runbook",
    avatarBg: "linear-gradient(135deg, #34d399, #10b981)",
  },
  {
    id: "3",
    name: "Jordan Lee",
    initials: "JL",
    color: "#f59e0b",
    activity: "Reviewing correlation",
    avatarBg: "linear-gradient(135deg, #f59e0b, #d97706)",
  },
  {
    id: "4",
    name: "Sam Rodriguez",
    initials: "SR",
    color: "#f472b6",
    activity: "Editing webhook",
    avatarBg: "linear-gradient(135deg, #f472b6, #ec4899)",
  },
];

const ACTIVITIES = [
  "Analyzing alert",
  "Generating runbook",
  "Reviewing correlation",
  "Editing webhook",
  "Viewing monitoring",
  "Checking Slack",
  "Browsing favorites",
  "Idle",
];

export default function CollabPresence() {
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const refreshActivities = useCallback(() => {
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        activity: ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)],
      }))
    );
    setLastRefresh(Date.now());
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshActivities, 30000);
    return () => clearInterval(interval);
  }, [refreshActivities]);

  // Pick 2-4 online members randomly each refresh
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set(TEAM_MEMBERS.map((m) => m.id)));

  useEffect(() => {
    const count = 2 + Math.floor(Math.random() * 3); // 2-4
    const shuffled = [...TEAM_MEMBERS].sort(() => Math.random() - 0.5);
    setOnlineIds(new Set(shuffled.slice(0, count).map((m) => m.id)));
  }, [lastRefresh]);

  const onlineMembers = members.filter((m) => onlineIds.has(m.id));
  const onlineCount = onlineMembers.length;

  return (
    <div className="flex items-center gap-2">
      {/* Avatar stack */}
      <div className="flex items-center -space-x-2">
        {onlineMembers.map((member, i) => (
          <div
            key={member.id}
            className="relative"
            style={{ zIndex: onlineCount - i }}
            onMouseEnter={() => setHoveredId(member.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 cursor-default transition-transform hover:scale-110 hover:z-50"
              style={{
                background: member.avatarBg,
                borderColor: "var(--background)",
              }}
            >
              {member.initials}
            </div>

            {/* Online pulse dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px]"
              style={{
                background: "#22c55e",
                borderColor: "var(--background)",
                boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.4)",
                animation: "statusPulse 2s ease-in-out infinite",
              }}
            />

            {/* Tooltip */}
            {hoveredId === member.id && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-lg text-center whitespace-nowrap animate-fade-in pointer-events-none"
                style={{
                  background: "rgba(24, 24, 27, 0.92)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(63, 63, 70, 0.5)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                  zIndex: 100,
                }}
              >
                <p className="text-xs font-semibold text-zinc-100">{member.name}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1 justify-center">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: member.color }}
                  />
                  {member.activity}
                </p>
                {/* Arrow */}
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                  style={{
                    background: "rgba(24, 24, 27, 0.92)",
                    borderLeft: "1px solid rgba(63, 63, 70, 0.5)",
                    borderTop: "1px solid rgba(63, 63, 70, 0.5)",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Count label */}
      <span className="text-[11px] text-zinc-500 font-medium tabular-nums hidden sm:inline">
        {onlineCount} online
      </span>
    </div>
  );
}
