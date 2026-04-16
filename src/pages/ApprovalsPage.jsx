// ─── APPROVALS PAGE ───────────────────────────────────────────────────────────

import { STATUSES } from '../data/constants.js';
import { statusBg, statusColor } from '../utils/eventUtils.js';
import { fmt, fmtTime } from '../utils/dateUtils.js';

function ApprovalsPage({ events, venues, users, setModal }) {
  const pending = events.filter((e) => e.status === STATUSES.PENDING);
  const recent  = events.filter((e) => e.status === STATUSES.APPROVED || e.status === STATUSES.REJECTED).slice(-6).reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#f1f5f9" }}>Approval Workflow</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{pending.length} event{pending.length !== 1 ? "s" : ""} awaiting review</p>
      </div>

      {pending.length > 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            Pending Review
            <span className="badge" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>{pending.length}</span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pending.map((ev) => {
              const venue     = venues.find((v) => v.id === ev.venueId);
              const organizer = users.find((u) => u.id === ev.organizerId);
              return (
                <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{ev.title}</div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{fmt(ev.date)} · {fmtTime(ev.startTime)}–{fmtTime(ev.endTime)}</span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{venue?.name}</span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>by {organizer?.name}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button className="btn" onClick={() => setModal({ type: "viewEvent", event: ev })} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 12px", color: "#94a3b8", fontSize: 12 }}>View</button>
                    <button className="btn" onClick={() => setModal({ type: "approveReject", event: ev })} style={{ background: "linear-gradient(135deg,#c084fc,#818cf8)", color: "#fff", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600 }}>Review</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>All caught up!</div>
          <div style={{ fontSize: 13, color: "#475569" }}>No events pending approval.</div>
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Recent Decisions</h3>
        {recent.length === 0
          ? <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: 20 }}>No decisions yet</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recent.map((ev) => {
                const approver = ev.approvedBy ? users.find((u) => u.id === ev.approvedBy) : null;
                return (
                  <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(ev.status), flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{ev.title}</span>
                      {ev.approvalNote && <span style={{ fontSize: 11, color: "#475569", marginLeft: 8 }}>— "{ev.approvalNote}"</span>}
                    </div>
                    <span className="badge" style={{ background: statusBg(ev.status), color: statusColor(ev.status), fontSize: 10 }}>{ev.status}</span>
                    {approver && <span style={{ fontSize: 11, color: "#475569" }}>by {approver.name.split(" ")[0]}</span>}
                  </div>
                );
              })}
            </div>
        }
      </div>
    </div>
  );
}

export default ApprovalsPage;
