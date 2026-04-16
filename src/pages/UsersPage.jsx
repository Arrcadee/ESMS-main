// ─── USERS PAGE ───────────────────────────────────────────────────────────────

import { ROLES } from '../data/constants.js';
import { fmt } from '../utils/dateUtils.js';

function UsersPage({ users, setUsers, showToast }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#f1f5f9" }}>User Management</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{users.length} registered accounts</p>
      </div>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {users.map((u) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ width: 42, height: 42, background: "linear-gradient(135deg,#c084fc,#818cf8)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{u.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{u.name}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>{u.email} · {u.department}</div>
              </div>
              <select
                value={u.role}
                onChange={(e) => {
                  setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, role: e.target.value } : x));
                  showToast(`${u.name}'s role updated to ${e.target.value}`);
                }}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", color: "#94a3b8", fontSize: 12, fontFamily: "inherit", cursor: "pointer", outline: "none" }}
              >
                {Object.values(ROLES).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <div style={{ fontSize: 11, color: "#334155" }}>Joined {fmt(u.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
