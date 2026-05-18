// ─── EVENT FORM MODAL ─────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { CATEGORIES } from '../data/constants.js';
import { detectConflicts } from '../utils/eventUtils.js';
import { fmt, fmtDate, addDays, fmtTime } from '../utils/dateUtils.js';
import Icon from '../components/Icon.jsx';

// ─── STABLE FIELD COMPONENT (defined outside to prevent remount) ──────────────
const Field = ({ label, error, children }) => (
  <div>
    <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>{label}</label>
    {children}
    {error && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{error}</div>}
  </div>
);

function EventFormModal({ onClose, onSave, venues, events, currentUser, editData }) {
  const [form, setForm] = useState(
    editData
      ? { ...editData, venueId: String(editData.venueId), tags: (editData.tags || []).join(", ") }
      : { title: "", description: "", category: CATEGORIES[0], date: fmtDate(addDays(new Date(), 7)), startTime: "09:00", endTime: "12:00", venueId: String(venues[0]?.id || ""), tags: "" }
  );
  const [conflicts, setConflicts] = useState([]);
  const [errors,    setErrors]    = useState({});

  // ─── DEBUG: Mount tracker (for diagnosing remount issues) ────────────────────
  useEffect(() => {
    console.log("✓ EventFormModal mounted");
    return () => console.log("✗ EventFormModal unmounted");
  }, []);

  useEffect(() => {
    if (form.date && form.startTime && form.endTime && form.venueId) {
      setConflicts(detectConflicts(events, { ...form, venueId: parseInt(form.venueId) }, editData?.id));
    }
  }, [form,form.date, form.startTime, form.endTime, form.venueId, events, editData]);

  const validate = () => {
    const e = {};
    if (!form.title.trim())              e.title = "Title is required";
    if (!form.date)                       e.date  = "Date is required";
    if (!form.startTime || !form.endTime) e.time  = "Both times are required";
    if (form.startTime >= form.endTime)   e.time  = "End time must be after start time";
    if (!form.venueId)                    e.venue = "Venue is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || conflicts.length > 0) return;
    const success = onSave(
      { ...form, venueId: parseInt(form.venueId), tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [] },
      editData?.id
    );
    if (success) onClose();
  };

  return (
    <div className="modal">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20 }}>{editData ? "Edit Event" : "Create New Event"}</h2>
        <button className="btn" onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}><Icon name="x" size={16} /></button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="EVENT TITLE" error={errors.title}>
          <input className="input-field" placeholder="e.g. Annual Science Exhibition" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </Field>

        <Field label="DESCRIPTION">
          <textarea className="input-field" rows={3} placeholder="Describe the event..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="CATEGORY">
            <select className="input-field" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="VENUE" error={errors.venue}>
            <select className="input-field" value={form.venueId} onChange={(e) => setForm((f) => ({ ...f, venueId: e.target.value }))}>
              {venues.map((v) => <option key={v.id} value={v.id}>{v.name} (cap. {v.capacity})</option>)}
            </select>
          </Field>
        </div>

        <Field label="EVENT DATE" error={errors.date}>
          <input className="input-field" type="date" value={form.date} min={fmtDate(new Date())} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="START TIME" error={errors.time}>
            <input className="input-field" type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
          </Field>
          <Field label="END TIME">
            <input className="input-field" type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
          </Field>
        </div>

        <Field label="TAGS (comma-separated)">
          <input className="input-field" placeholder="e.g. science, innovation, students" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
        </Field>

        {conflicts.length > 0 && (
          <div className="conflict-warning">
            <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#ef4444", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
              <Icon name="warning" size={16} /> Scheduling Conflict Detected
            </div>
            {conflicts.map((c) => (
              <div key={c.id} style={{ fontSize: 12, color: "#fca5a5", marginBottom: 4 }}>
                ⚠ "{c.title}" — {fmt(form.date)}, {fmtTime(form.startTime)}–{fmtTime(form.endTime)} is already booked at this venue.
              </div>
            ))}
            <div style={{ fontSize: 11, color: "#ef4444", marginTop: 6 }}>Please choose a different venue or time slot.</div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn" onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 20px", color: "#94a3b8", fontSize: 13 }}>Cancel</button>
          <button className="btn" onClick={handleSubmit} disabled={conflicts.length > 0}
            style={{ background: conflicts.length > 0 ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#c084fc,#818cf8)", color: conflicts.length > 0 ? "#475569" : "#fff", padding: "10px 24px", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: conflicts.length > 0 ? "not-allowed" : "pointer" }}>
            {editData ? "Save Changes" : "Submit for Approval"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventFormModal;
