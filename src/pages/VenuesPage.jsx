// ─── VENUES PAGE ──────────────────────────────────────────────────────────────

import { STATUSES } from "../data/constants.js";
import { fmtDate } from "../utils/dateUtils.js";
import Icon from "../components/Icon.jsx";

function VenuesPage({ venues, events }) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
			<div>
				<h1
					style={{
						fontFamily: "'Syne',sans-serif",
						fontSize: 26,
						fontWeight: 800,
						color: "#f1f5f9",
					}}
				>
					Venues
				</h1>
				<p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
					{venues.length} registered venues
				</p>
			</div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
					gap: 16,
				}}
			>
				{venues.map((v) => {
					const venueEvents = events.filter(
						(e) => e.venueId === v.id && e.status !== STATUSES.REJECTED,
					);
					const upcoming = venueEvents.filter(
						(e) =>
							e.date >= fmtDate(new Date()) && e.status === STATUSES.APPROVED,
					).length;
					return (
						<div key={v.id} className="card" style={{ padding: 22 }}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
									marginBottom: 14,
								}}
							>
								<div
									style={{
										width: 44,
										height: 44,
										background: "rgba(129,140,248,0.12)",
										borderRadius: 12,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#818cf8",
									}}
								>
									<Icon name="venue" size={22} />
								</div>
								<span
									className="badge"
									style={{
										background:
											upcoming > 0
												? "rgba(16,185,129,0.12)"
												: "rgba(255,255,255,0.05)",
										color: upcoming > 0 ? "#10b981" : "#475569",
										fontSize: 10,
									}}
								>
									{upcoming > 0 ? `${upcoming} upcoming` : "Free"}
								</span>
							</div>
							<h3
								style={{
									fontSize: 15,
									fontWeight: 700,
									color: "#f1f5f9",
									marginBottom: 4,
								}}
							>
								{v.name}
							</h3>
							<div style={{ fontSize: 12, color: "#475569", marginBottom: 14 }}>
								{v.building}
							</div>
							<div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
								<div
									style={{
										flex: 1,
										padding: 10,
										background: "rgba(255,255,255,0.03)",
										borderRadius: 8,
										textAlign: "center",
									}}
								>
									<div
										style={{ fontSize: 18, fontWeight: 700, color: "#818cf8" }}
									>
										{v.capacity}
									</div>
									<div style={{ fontSize: 10, color: "#475569" }}>Capacity</div>
								</div>
								<div
									style={{
										flex: 1,
										padding: 10,
										background: "rgba(255,255,255,0.03)",
										borderRadius: 8,
										textAlign: "center",
									}}
								>
									<div
										style={{ fontSize: 18, fontWeight: 700, color: "#c084fc" }}
									>
										{venueEvents.length}
									</div>
									<div style={{ fontSize: 10, color: "#475569" }}>
										Total Events
									</div>
								</div>
							</div>
							<div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
								{v.facilities.map((f) => (
									<span
										key={f}
										className="badge"
										style={{
											background: "rgba(255,255,255,0.04)",
											color: "#64748b",
											fontSize: 10,
										}}
									>
										{f}
									</span>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default VenuesPage;
