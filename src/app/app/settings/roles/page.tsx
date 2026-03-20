"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ───────── Types ───────── */
type RoleName = "Owner" | "Admin" | "Analyst" | "Viewer";

interface Permission {
  key: string;
  label: string;
  description: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: RoleName;
}

interface CustomRole {
  id: string;
  name: string;
  permissions: string[];
}

/* ───────── Constants ───────── */
const PERMISSIONS: Permission[] = [
  { key: "analyze", label: "Analyze", description: "Run AI alert analysis" },
  { key: "runbooks", label: "Runbooks", description: "Generate & view runbooks" },
  { key: "correlate", label: "Correlate", description: "Correlate multiple alerts" },
  { key: "webhooks", label: "Webhooks", description: "Manage webhook endpoints" },
  { key: "monitoring", label: "Monitoring", description: "View monitoring dashboard" },
  { key: "settings", label: "Settings", description: "Manage team & roles" },
];

const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  Owner: ["analyze", "runbooks", "correlate", "webhooks", "monitoring", "settings"],
  Admin: ["analyze", "runbooks", "correlate", "webhooks", "monitoring"],
  Analyst: ["analyze", "runbooks", "correlate", "monitoring"],
  Viewer: ["analyze", "monitoring"],
};

const ROLE_COLORS: Record<RoleName, { bg: string; text: string; border: string; label: string }> = {
  Owner: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "gold" },
  Admin: { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30", label: "indigo" },
  Analyst: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "emerald" },
  Viewer: { bg: "bg-zinc-500/15", text: "text-zinc-400", border: "border-zinc-500/30", label: "gray" },
};

const ROLES: RoleName[] = ["Owner", "Admin", "Analyst", "Viewer"];

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: "1", name: "Sai Kiran", email: "sai@autensa.ai", avatar: "SK", role: "Owner" },
  { id: "2", name: "Priya Sharma", email: "priya@autensa.ai", avatar: "PS", role: "Admin" },
  { id: "3", name: "Ravi Kumar", email: "ravi@autensa.ai", avatar: "RK", role: "Analyst" },
  { id: "4", name: "Anita Patel", email: "anita@autensa.ai", avatar: "AP", role: "Analyst" },
  { id: "5", name: "Dev Ops Bot", email: "bot@autensa.ai", avatar: "DB", role: "Viewer" },
];

const STORAGE_KEY_MEMBERS = "k8s-rbac-members";
const STORAGE_KEY_CUSTOM_ROLES = "k8s-rbac-custom-roles";

/* ───────── Component ───────── */
export default function RolesPage() {
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"matrix" | "members" | "custom">("matrix");

  // Load from localStorage
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
      if (savedMembers) setMembers(JSON.parse(savedMembers));
      const savedCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_ROLES);
      if (savedCustom) setCustomRoles(JSON.parse(savedCustom));
    } catch { /* ignore */ }
  }, []);

  // Persist
  const persistMembers = (m: TeamMember[]) => {
    setMembers(m);
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(m));
  };

  const persistCustomRoles = (r: CustomRole[]) => {
    setCustomRoles(r);
    localStorage.setItem(STORAGE_KEY_CUSTOM_ROLES, JSON.stringify(r));
  };

  const updateMemberRole = (id: string, role: RoleName) => {
    persistMembers(members.map((m) => (m.id === id ? { ...m, role } : m)));
  };

  const saveCustomRole = () => {
    if (!newRoleName.trim() || newRolePerms.length === 0) return;
    const role: CustomRole = {
      id: Date.now().toString(),
      name: newRoleName.trim(),
      permissions: newRolePerms,
    };
    persistCustomRoles([...customRoles, role]);
    setNewRoleName("");
    setNewRolePerms([]);
    setShowBuilder(false);
  };

  const deleteCustomRole = (id: string) => {
    persistCustomRoles(customRoles.filter((r) => r.id !== id));
  };

  const togglePerm = (perm: string) => {
    setNewRolePerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/app"
              className="p-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
              aria-label="Back to dashboard"
            >
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-zinc-100">Roles &amp; Permissions</h1>
          </div>
          <p className="text-sm text-zinc-500 ml-10">Manage team access with role-based controls</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800/50 w-fit" role="tablist" aria-label="RBAC sections">
        {(["matrix", "members", "custom"] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            {tab === "matrix" ? "Permissions Matrix" : tab === "members" ? "Team Members" : "Custom Roles"}
          </button>
        ))}
      </div>

      {/* ───── Permissions Matrix ───── */}
      {activeTab === "matrix" && (
        <div id="panel-matrix" role="tabpanel" aria-label="Permissions matrix" className="rounded-xl border border-zinc-800/50 overflow-hidden" style={{ background: "var(--card-bg)" }}>
          <div className="overflow-x-auto">
            <table className="w-full" role="grid" aria-label="Role permissions matrix">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-300" scope="col">Permission</th>
                  {ROLES.map((role) => (
                    <th key={role} className="px-6 py-4 text-center" scope="col">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${ROLE_COLORS[role].bg} ${ROLE_COLORS[role].text} ${ROLE_COLORS[role].border}`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: "currentColor" }} aria-hidden="true" />
                        {role}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm, i) => (
                  <tr key={perm.key} className={`border-b border-zinc-800/30 ${i % 2 === 0 ? "" : "bg-zinc-900/20"}`}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-200">{perm.label}</div>
                      <div className="text-xs text-zinc-500">{perm.description}</div>
                    </td>
                    {ROLES.map((role) => {
                      const allowed = ROLE_PERMISSIONS[role].includes(perm.key);
                      return (
                        <td key={role} className="px-6 py-4 text-center">
                          {allowed ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30" aria-label={`${role} has ${perm.label} permission`}>
                              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800/30 border border-zinc-700/30" aria-label={`${role} does not have ${perm.label} permission`}>
                              <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───── Team Members ───── */}
      {activeTab === "members" && (
        <div id="panel-members" role="tabpanel" aria-label="Team members" className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800/50 transition-all hover:border-zinc-700/60"
              style={{ background: "var(--card-bg)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${ROLE_COLORS[member.role].bg} ${ROLE_COLORS[member.role].text} border ${ROLE_COLORS[member.role].border}`}
                  aria-hidden="true"
                >
                  {member.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{member.name}</div>
                  <div className="text-xs text-zinc-500">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor={`role-select-${member.id}`} className="sr-only">
                  Role for {member.name}
                </label>
                <select
                  id={`role-select-${member.id}`}
                  value={member.role}
                  onChange={(e) => updateMemberRole(member.id, e.target.value as RoleName)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  aria-label={`Change role for ${member.name}`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${ROLE_COLORS[member.role].bg} ${ROLE_COLORS[member.role].text} ${ROLE_COLORS[member.role].border}`}
                  aria-label={`Current role: ${member.role}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: "currentColor" }} aria-hidden="true" />
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───── Custom Roles ───── */}
      {activeTab === "custom" && (
        <div id="panel-custom" role="tabpanel" aria-label="Custom roles" className="space-y-6">
          {/* Existing custom roles */}
          {customRoles.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-300">Your Custom Roles</h2>
              {customRoles.map((cr) => (
                <div
                  key={cr.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-800/50"
                  style={{ background: "var(--card-bg)" }}
                >
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-purple-500/15 text-purple-400 border-purple-500/30">
                      <span className="w-2 h-2 rounded-full bg-purple-400" aria-hidden="true" />
                      {cr.name}
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cr.permissions.map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded text-xs bg-zinc-800/50 text-zinc-400 border border-zinc-700/30">
                          {PERMISSIONS.find((pp) => pp.key === p)?.label || p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCustomRole(cr.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                    aria-label={`Delete custom role ${cr.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Builder toggle */}
          {!showBuilder ? (
            <button
              onClick={() => setShowBuilder(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Open custom role builder"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Custom Role
            </button>
          ) : (
            <div
              className="p-6 rounded-xl border border-indigo-500/30 space-y-4 animate-fade-in"
              style={{ background: "var(--card-bg)" }}
              role="form"
              aria-label="Custom role builder"
            >
              <h2 className="text-lg font-semibold text-zinc-100">Custom Role Builder</h2>
              <div>
                <label htmlFor="custom-role-name" className="block text-sm font-medium text-zinc-400 mb-1">
                  Role Name
                </label>
                <input
                  id="custom-role-name"
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Senior SRE"
                  className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  style={{
                    background: "var(--input-bg)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  aria-required="true"
                />
              </div>
              <fieldset>
                <legend className="block text-sm font-medium text-zinc-400 mb-2">Permissions</legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PERMISSIONS.map((perm) => (
                    <label
                      key={perm.key}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        newRolePerms.includes(perm.key)
                          ? "border-indigo-500/40 bg-indigo-500/10"
                          : "border-zinc-800/50 hover:border-zinc-700/60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={newRolePerms.includes(perm.key)}
                        onChange={() => togglePerm(perm.key)}
                        className="sr-only"
                        aria-label={`Toggle ${perm.label} permission`}
                      />
                      <span
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          newRolePerms.includes(perm.key)
                            ? "bg-indigo-500 border-indigo-500"
                            : "border-zinc-600"
                        }`}
                        aria-hidden="true"
                      >
                        {newRolePerms.includes(perm.key) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm text-zinc-300">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex gap-2">
                <button
                  onClick={saveCustomRole}
                  disabled={!newRoleName.trim() || newRolePerms.length === 0}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Save custom role"
                >
                  Save Role
                </button>
                <button
                  onClick={() => {
                    setShowBuilder(false);
                    setNewRoleName("");
                    setNewRolePerms([]);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Cancel custom role creation"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-zinc-800/30" style={{ background: "var(--card-bg)" }}>
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Roles:</span>
        {ROLES.map((role) => (
          <span
            key={role}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${ROLE_COLORS[role].bg} ${ROLE_COLORS[role].text} ${ROLE_COLORS[role].border}`}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "currentColor" }} aria-hidden="true" />
            {role}
          </span>
        ))}
      </div>
    </div>
  );
}
