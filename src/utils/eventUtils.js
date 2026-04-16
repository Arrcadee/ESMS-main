// ─── EVENT UTILITIES ───────────────────────────────────────────────────────────

import { STATUSES } from '../data/constants.js';

export const timeToMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const detectConflicts = (events, newEvent, excludeId = null) => {
  const conflicts = [];
  events.forEach((ev) => {
    if (ev.id === excludeId) return;
    if (ev.status === STATUSES.REJECTED || ev.status === STATUSES.COMPLETED) return;
    if (ev.date === newEvent.date && ev.venueId === parseInt(newEvent.venueId)) {
      const existStart = timeToMin(ev.startTime);
      const existEnd = timeToMin(ev.endTime);
      const newStart = timeToMin(newEvent.startTime);
      const newEnd = timeToMin(newEvent.endTime);
      if (newStart < existEnd && newEnd > existStart) {
        conflicts.push(ev);
      }
    }
  });
  return conflicts;
};

export const statusColor = (s) =>
  ({ pending: "#f59e0b", approved: "#10b981", rejected: "#ef4444", completed: "#6366f1" }[s] || "#6b7280");

export const statusBg = (s) =>
({
  pending: "rgba(245,158,11,0.12)",
  approved: "rgba(16,185,129,0.12)",
  rejected: "rgba(239,68,68,0.12)",
  completed: "rgba(99,102,241,0.12)",
}[s] || "rgba(107,114,128,0.12)");

export const getCategoryColor = (cat) => {
  const CATEGORY_COLORS = {
    Academic: "#818cf8", Cultural: "#f472b6", Sports: "#34d399",
    Administrative: "#94a3b8", Workshop: "#fb923c", Seminar: "#38bdf8",
    Conference: "#a78bfa", Social: "#fbbf24",
  };
  return CATEGORY_COLORS[cat] || "#94a3b8";
};
