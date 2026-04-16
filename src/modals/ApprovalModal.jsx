// ─── APPROVAL MODAL ───────────────────────────────────────────────────────────

import { useState } from "react";
import { fmt, fmtTime } from "../utils/dateUtils.js";
import Icon from "../components/Icon.jsx";

function ApprovalModal({ event, onClose, onApprove, onReject, venues, users }) {
	// const [note] = useState("");
	const [feedback, setFeedback] = useState("");
	const venue = venues.find((v) => v.id === event.venueId);
	const organizer = users.find((u) => u.id === event.organizerId);

	return (
		<div className="modal">
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 20,
				}}
			>
				<h2
					style={{
						fontFamily: "'Syne',sans-serif",
						fontWeight: 800,
						fontSize: 18,
					}}
				>
					Review Event
				</h2>
				<button
					className="btn"
					onClick={onClose}
					style={{
						background: "rgba(255,255,255,0.05)",
						border: "none",
						borderRadius: 8,
						width: 32,
						height: 32,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#94a3b8",
					}}
				>
					<Icon name="x" size={16} />
				</button>
			</div>
			<div
				style={{
					padding: 16,
					background: "rgba(255,255,255,0.03)",
					borderRadius: 12,
					marginBottom: 16,
				}}
			>
				<h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
					{event.title}
				</h3>
				<p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
					{event.description}
				</p>
				<div
					style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
				>
					<div style={{ fontSize: 12, color: "#94a3b8" }}>
						<span style={{ color: "#475569" }}>Date: </span>
						{fmt(event.date)}
					</div>
					<div style={{ fontSize: 12, color: "#94a3b8" }}>
						<span style={{ color: "#475569" }}>Time: </span>
						{fmtTime(event.startTime)}–{fmtTime(event.endTime)}
					</div>
					<div style={{ fontSize: 12, color: "#94a3b8" }}>
						<span style={{ color: "#475569" }}>Venue: </span>
						{venue?.name}
					</div>
					<div style={{ fontSize: 12, color: "#94a3b8" }}>
						<span style={{ color: "#475569" }}>By: </span>
						{organizer?.name}
					</div>
				</div>
			</div>
			<div>
				<label
					style={{
						fontSize: 11,
						color: "#64748b",
						fontWeight: 600,
						display: "block",
						marginBottom: 8,
						letterSpacing: "0.05em",
					}}
				>
					NOTE / FEEDBACK (Optional)
				</label>
				<textarea
					className="input-field"
					rows={3}
					placeholder="Add a note for the organizer..."
					value={feedback}
					onChange={(e) => setFeedback(e.target.value)}
					style={{ resize: "vertical", marginBottom: 16 }}
				/>
			</div>
			<div style={{ display: "flex", gap: 12 }}>
				<button
					className="btn"
					onClick={() => onReject(event.id, feedback || "Rejected by admin.")}
					style={{
						flex: 1,
						background: "rgba(239,68,68,0.1)",
						border: "1px solid rgba(239,68,68,0.25)",
						borderRadius: 10,
						padding: 11,
						color: "#ef4444",
						fontWeight: 700,
						fontSize: 13,
					}}
				>
					Reject
				</button>
				<button
					className="btn"
					onClick={() => onApprove(event.id, feedback)}
					style={{
						flex: 1,
						background: "linear-gradient(135deg,#10b981,#059669)",
						color: "#fff",
						borderRadius: 10,
						padding: 11,
						fontWeight: 700,
						fontSize: 13,
					}}
				>
					Approve
				</button>
			</div>
		</div>
	);
}

export default ApprovalModal;
