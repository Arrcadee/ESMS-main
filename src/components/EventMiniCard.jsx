// ─── EVENT MINI CARD ──────────────────────────────────────────────────────────

import { statusBg, statusColor } from "../utils/eventUtils.js";
import { fmtTime } from "../utils/dateUtils.js";

function EventMiniCard({ event, onClick }) {
	return (
		<div
			onClick={onClick}
			style={{
				display: "flex",
				gap: 12,
				padding: "12px 14px",
				background: "rgba(255,255,255,0.03)",
				borderRadius: 10,
				cursor: "pointer",
				border: "1px solid transparent",
				transition: "all 0.15s",
			}}
			onMouseEnter={(e) =>
				(e.currentTarget.style.borderColor = "rgba(192,132,252,0.2)")
			}
			onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
		>
			<div
				style={{
					width: 42,
					height: 42,
					background: statusBg(event.status),
					borderRadius: 10,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
					border: `1px solid ${statusColor(event.status)}30`,
				}}
			>
				<div
					style={{
						fontSize: 13,
						fontWeight: 700,
						color: statusColor(event.status),
						lineHeight: 1,
					}}
				>
					{new Date(event.date).getDate()}
				</div>
				<div
					style={{
						fontSize: 9,
						color: statusColor(event.status),
						textTransform: "uppercase",
					}}
				>
					{new Date(event.date).toLocaleDateString("en", { month: "short" })}
				</div>
			</div>
			<div style={{ flex: 1, minWidth: 0 }}>
				<div
					style={{
						fontSize: 13,
						fontWeight: 600,
						color: "#e2e8f0",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{event.title}
				</div>
				<div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
					{fmtTime(event.startTime)} – {fmtTime(event.endTime)} ·{" "}
					{event.category}
				</div>
			</div>
			<span
				className="badge"
				style={{
					background: statusBg(event.status),
					color: statusColor(event.status),
					flexShrink: 0,
					fontSize: 10,
				}}
			>
				{event.status}
			</span>
		</div>
	);
}

export default EventMiniCard;
