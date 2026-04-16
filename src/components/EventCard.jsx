// ─── EVENT CARD ──────────────────────────────────────────────────────────────

import {
	getCategoryColor,
	statusBg,
	statusColor,
} from "../utils/eventUtils.js";
import { fmt, fmtTime } from "../utils/dateUtils.js";
import Icon from "./Icon.jsx";

function EventCard({ event, venues, users, onClick }) {
	const venue = venues.find((v) => v.id === event.venueId);
	const organizer = users.find((u) => u.id === event.organizerId);

	return (
		<div className="event-card" onClick={onClick}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					marginBottom: 12,
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
			<h3
				style={{
					fontSize: 15,
					fontWeight: 700,
					color: "#f1f5f9",
					marginBottom: 8,
					lineHeight: 1.3,
				}}
			>
				{event.title}
			</h3>
			<p
				style={{
					fontSize: 12,
					color: "#64748b",
					lineHeight: 1.5,
					marginBottom: 12,
					display: "-webkit-box",
					WebkitLineClamp: 2,
					WebkitBoxOrient: "vertical",
					overflow: "hidden",
				}}
			>
				{event.description}
			</p>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 6,
					borderTop: "1px solid rgba(255,255,255,0.05)",
					paddingTop: 12,
				}}
			>
				{[
					{ icon: "calendar", value: fmt(event.date) },
					{
						icon: "clock",
						value: `${fmtTime(event.startTime)} – ${fmtTime(event.endTime)}`,
					},
					{ icon: "venue", value: venue?.name || "TBD" },
					{ icon: "users", value: organizer?.name || "Unknown" },
				].map((row) => (
					<div
						key={row.icon}
						style={{
							display: "flex",
							gap: 6,
							alignItems: "center",
							fontSize: 12,
							color: "#94a3b8",
						}}
					>
						<Icon name={row.icon} size={13} />
						<span
							style={{
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{row.value}
						</span>
					</div>
				))}
			</div>

			{event.attendees > 0 && venue && (
				<div style={{ marginTop: 10 }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginBottom: 4,
						}}
					>
						<span style={{ fontSize: 10, color: "#64748b" }}>Attendance</span>
						<span style={{ fontSize: 10, color: "#94a3b8" }}>
							{event.attendees} registered
						</span>
					</div>
					<div className="progress-bar">
						<div
							className="progress-fill"
							style={{
								width: `${Math.min((event.attendees / venue.capacity) * 100, 100)}%`,
								background: "#c084fc",
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
}

export default EventCard;
