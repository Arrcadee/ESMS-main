// ─── EVENT DETAIL MODAL ───────────────────────────────────────────────────────

import { useState } from "react";
import { ROLES, STATUSES } from "../data/constants.js";
import {
	statusBg,
	statusColor,
	getCategoryColor,
} from "../utils/eventUtils.js";
import { fmt, fmtTime } from "../utils/dateUtils.js";
import Icon from "../components/Icon.jsx";

function EventDetailModal({
	event,
	venues,
	users,
	onClose,
	onEdit,
	onDelete,
	canManage,
	onApprove,
	onReject,
	currentUser,
}) {
	const venue = venues.find((v) => v.id === event.venueId);
	const organizer = users.find((u) => u.id === event.organizerId);
	const approver = event.approvedBy
		? users.find((u) => u.id === event.approvedBy)
		: null;
	const isAdmin =
		currentUser?.role === ROLES.ADMIN ||
		currentUser?.role === ROLES.SUPER_ADMIN;
	const [rejectNote, setRejectNote] = useState("");
	const [showReject, setShowReject] = useState(false);

	return (
		<div className="modal" style={{ maxWidth: 600 }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					marginBottom: 20,
				}}
			>
				<div style={{ flex: 1 }}>
					<div
						style={{
							display: "flex",
							gap: 8,
							marginBottom: 8,
							flexWrap: "wrap",
						}}
					>
						<span
							className="badge"
							style={{
								background: `${getCategoryColor(event.category)}18`,
								color: getCategoryColor(event.category),
								fontSize: 10,
							}}
						>
							{event.category}
						</span>
						<span
							className="badge"
							style={{
								background: statusBg(event.status),
								color: statusColor(event.status),
								fontSize: 10,
							}}
						>
							{event.status}
						</span>
					</div>
					<h2
						style={{
							fontFamily: "'Syne',sans-serif",
							fontWeight: 800,
							fontSize: 20,
							lineHeight: 1.3,
						}}
					>
						{event.title}
					</h2>
				</div>
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
						flexShrink: 0,
						marginLeft: 12,
					}}
				>
					<Icon name="x" size={16} />
				</button>
			</div>

			<p
				style={{
					fontSize: 13,
					color: "#94a3b8",
					lineHeight: 1.6,
					marginBottom: 20,
				}}
			>
				{event.description}
			</p>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: 12,
					marginBottom: 20,
				}}
			>
				{[
					{ icon: "calendar", label: "Date", value: fmt(event.date) },
					{
						icon: "clock",
						label: "Time",
						value: `${fmtTime(event.startTime)} – ${fmtTime(event.endTime)}`,
					},
					{ icon: "venue", label: "Venue", value: venue?.name || "TBD" },
					{
						icon: "users",
						label: "Organizer",
						value: organizer?.name || "Unknown",
					},
					{ icon: "calendar", label: "Submitted", value: fmt(event.createdAt) },
					...(event.attendees > 0
						? [
								{
									icon: "tag",
									label: "Attendees",
									value: `${event.attendees} registered`,
								},
							]
						: []),
				].map((item) => (
					<div
						key={item.label}
						style={{
							display: "flex",
							gap: 10,
							alignItems: "flex-start",
							padding: "12px 14px",
							background: "rgba(255,255,255,0.03)",
							borderRadius: 10,
						}}
					>
						<div style={{ color: "#c084fc", marginTop: 1 }}>
							<Icon name={item.icon} size={15} />
						</div>
						<div>
							<div
								style={{
									fontSize: 10,
									color: "#475569",
									fontWeight: 600,
									marginBottom: 2,
									letterSpacing: "0.05em",
								}}
							>
								{item.label.toUpperCase()}
							</div>
							<div style={{ fontSize: 13, color: "#e2e8f0" }}>{item.value}</div>
						</div>
					</div>
				))}
			</div>

			{venue?.facilities?.length > 0 && (
				<div
					style={{
						padding: "12px 14px",
						background: "rgba(255,255,255,0.03)",
						borderRadius: 10,
						marginBottom: 16,
					}}
				>
					<div
						style={{
							fontSize: 10,
							color: "#475569",
							fontWeight: 600,
							marginBottom: 8,
							letterSpacing: "0.05em",
						}}
					>
						VENUE FACILITIES
					</div>
					<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
						{venue.facilities.map((f) => (
							<span
								key={f}
								className="badge"
								style={{
									background: "rgba(129,140,248,0.12)",
									color: "#818cf8",
									fontSize: 10,
								}}
							>
								{f}
							</span>
						))}
					</div>
				</div>
			)}

			{event.approvalNote && (
				<div
					style={{
						padding: "12px 14px",
						background: "rgba(192,132,252,0.06)",
						border: "1px solid rgba(192,132,252,0.15)",
						borderRadius: 10,
						marginBottom: 16,
					}}
				>
					<div
						style={{
							fontSize: 10,
							color: "#c084fc",
							fontWeight: 600,
							marginBottom: 4,
							letterSpacing: "0.05em",
						}}
					>
						APPROVAL NOTE{approver ? ` — ${approver.name}` : ""}
					</div>
					<div style={{ fontSize: 13, color: "#94a3b8" }}>
						{event.approvalNote}
					</div>
				</div>
			)}

			{event.tags?.length > 0 && (
				<div
					style={{
						display: "flex",
						gap: 6,
						flexWrap: "wrap",
						marginBottom: 16,
					}}
				>
					{event.tags.map((t) => (
						<span
							key={t}
							className="badge"
							style={{
								background: "rgba(255,255,255,0.05)",
								color: "#64748b",
								fontSize: 10,
							}}
						>
							#{t}
						</span>
					))}
				</div>
			)}

			{showReject && (
				<div style={{ marginBottom: 16 }}>
					<label
						style={{
							fontSize: 11,
							color: "#64748b",
							fontWeight: 600,
							display: "block",
							marginBottom: 6,
						}}
					>
						REJECTION REASON
					</label>
					<textarea
						className="input-field"
						rows={3}
						placeholder="Provide reason for rejection..."
						value={rejectNote}
						onChange={(e) => setRejectNote(e.target.value)}
						style={{ resize: "vertical" }}
					/>
				</div>
			)}

			<div
				style={{
					display: "flex",
					gap: 10,
					flexWrap: "wrap",
					justifyContent: "flex-end",
				}}
			>
				{isAdmin && event.status === STATUSES.PENDING && !showReject && (
					<>
						<button
							className="btn"
							onClick={() => setShowReject(true)}
							style={{
								background: "rgba(239,68,68,0.1)",
								border: "1px solid rgba(239,68,68,0.2)",
								borderRadius: 10,
								padding: "9px 18px",
								color: "#ef4444",
								fontSize: 13,
								fontWeight: 600,
							}}
						>
							Reject
						</button>
						<button
							className="btn"
							onClick={() => onApprove(event.id, "")}
							style={{
								background: "rgba(16,185,129,0.1)",
								border: "1px solid rgba(16,185,129,0.2)",
								borderRadius: 10,
								padding: "9px 18px",
								color: "#10b981",
								fontSize: 13,
								fontWeight: 600,
							}}
						>
							Approve
						</button>
					</>
				)}
				{showReject && (
					<>
						<button
							className="btn"
							onClick={() => setShowReject(false)}
							style={{
								background: "rgba(255,255,255,0.05)",
								border: "1px solid rgba(255,255,255,0.08)",
								borderRadius: 10,
								padding: "9px 18px",
								color: "#94a3b8",
								fontSize: 13,
							}}
						>
							Cancel
						</button>
						<button
							className="btn"
							onClick={() =>
								onReject(event.id, rejectNote || "Rejected by admin.")
							}
							style={{
								background: "rgba(239,68,68,0.15)",
								border: "1px solid rgba(239,68,68,0.3)",
								borderRadius: 10,
								padding: "9px 18px",
								color: "#ef4444",
								fontSize: 13,
								fontWeight: 600,
							}}
						>
							Confirm Rejection
						</button>
					</>
				)}
				{canManage &&
					event.status !== STATUSES.COMPLETED &&
					event.status !== STATUSES.APPROVED && (
						<button
							className="btn"
							onClick={() => {
								onClose();
								onEdit(event);
							}}
							style={{
								background: "rgba(192,132,252,0.1)",
								border: "1px solid rgba(192,132,252,0.2)",
								borderRadius: 10,
								padding: "9px 18px",
								color: "#c084fc",
								fontSize: 13,
								fontWeight: 600,
							}}
						>
							Edit Event
						</button>
					)}
				{canManage && event.status === STATUSES.PENDING && (
					<button
						className="btn"
						onClick={() => onDelete(event.id)}
						style={{
							background: "rgba(239,68,68,0.08)",
							border: "1px solid rgba(239,68,68,0.15)",
							borderRadius: 10,
							padding: "9px 18px",
							color: "#ef4444",
							fontSize: 13,
							fontWeight: 600,
						}}
					>
						Delete
					</button>
				)}
			</div>
		</div>
	);
}

export default EventDetailModal;
