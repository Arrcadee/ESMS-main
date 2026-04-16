// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────

// import { useMemo } from "react";
import { STATUSES, CATEGORIES, ROLES } from "../data/constants.js";
// import { getCategoryColor } from "../utils/eventUtils.js";
// import { fmtDate } from "../utils/dateUtils.js";
import BarChart from "../components/BarChart.jsx";
import DonutChart from "../components/DonutChart.jsx";

function AnalyticsPage({ events, venues, users }) {
	const stats = {
		total: events.length,
		approved: events.filter((e) => e.status === STATUSES.APPROVED).length,
		rejected: events.filter((e) => e.status === STATUSES.REJECTED).length,
		completed: events.filter((e) => e.status === STATUSES.COMPLETED).length,
		pending: events.filter((e) => e.status === STATUSES.PENDING).length,
		totalAttendees: events.reduce((s, e) => s + e.attendees, 0),
		approvalRate:
			events.filter((e) => e.status !== STATUSES.PENDING).length > 0
				? Math.round(
						(events.filter(
							(e) =>
								e.status === STATUSES.APPROVED ||
								e.status === STATUSES.COMPLETED,
						).length /
							events.filter((e) => e.status !== STATUSES.PENDING).length) *
							100,
					)
				: 0,
	};

	const categoryData = CATEGORIES.map((cat) => ({
		label: cat.slice(0, 4),
		value: events.filter((e) => e.category === cat).length,
		full: cat,
	})).filter((c) => c.value > 0);

	const venueUsage = venues
		.map((v) => ({
			...v,
			count: events.filter(
				(e) => e.venueId === v.id && e.status !== STATUSES.REJECTED,
			).length,
		}))
		.sort((a, b) => b.count - a.count);

	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const monthlyApproved = months.map((label, i) => ({
		label,
		value: events.filter(
			(e) =>
				new Date(e.date).getMonth() === i && e.status === STATUSES.APPROVED,
		).length,
	}));

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
					Analytics
				</h1>
				<p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
					System-wide event statistics and insights
				</p>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
					gap: 16,
				}}
			>
				{[
					{
						label: "Approval Rate",
						value: `${stats.approvalRate}%`,
						sub: "of decided events",
						color: "#10b981",
					},
					{
						label: "Total Attendees",
						value: stats.totalAttendees.toLocaleString(),
						sub: "across all events",
						color: "#c084fc",
					},
					{
						label: "Active Venues",
						value: venues.length,
						sub: "registered venues",
						color: "#818cf8",
					},
					{
						label: "Total Users",
						value: users.length,
						sub: "registered accounts",
						color: "#f472b6",
					},
				].map((k) => (
					<div key={k.label} className="stat-card">
						<div
							style={{
								fontSize: 30,
								fontWeight: 700,
								fontFamily: "'Syne',sans-serif",
								color: k.color,
							}}
						>
							{k.value}
						</div>
						<div
							style={{
								fontSize: 13,
								fontWeight: 600,
								color: "#e2e8f0",
								marginTop: 4,
							}}
						>
							{k.label}
						</div>
						<div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
							{k.sub}
						</div>
					</div>
				))}
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
				<div className="card" style={{ padding: 24 }}>
					<div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
						Events by Status
					</div>
					<DonutChart
						segments={[
							{ label: "Approved", value: stats.approved, color: "#10b981" },
							{ label: "Completed", value: stats.completed, color: "#6366f1" },
							{ label: "Pending", value: stats.pending, color: "#f59e0b" },
							{ label: "Rejected", value: stats.rejected, color: "#ef4444" },
						]}
					/>
				</div>
				<div className="card" style={{ padding: 24 }}>
					<div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
						Events by Category
					</div>
					<BarChart data={categoryData} color="#818cf8" />
					<div
						style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}
					>
						{categoryData.map((c) => (
							<span key={c.full} style={{ fontSize: 10, color: "#64748b" }}>
								{c.full}: {c.value}
							</span>
						))}
					</div>
				</div>
			</div>

			<div className="card" style={{ padding: 24 }}>
				<div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
					Monthly Approved Events
				</div>
				<BarChart data={monthlyApproved} color="#c084fc" />
			</div>

			<div className="card" style={{ padding: 24 }}>
				<div style={{ fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
					Venue Utilization
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
					{venueUsage.map((v) => {
						const maxCount = Math.max(...venueUsage.map((x) => x.count), 1);
						const pct = Math.min((v.count / maxCount) * 100, 100);
						return (
							<div key={v.id}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										marginBottom: 6,
									}}
								>
									<div>
										<span
											style={{
												fontSize: 13,
												fontWeight: 600,
												color: "#e2e8f0",
											}}
										>
											{v.name}
										</span>
										<span
											style={{ fontSize: 11, color: "#475569", marginLeft: 8 }}
										>
											{v.building}
										</span>
									</div>
									<div
										style={{ display: "flex", gap: 10, alignItems: "center" }}
									>
										<span style={{ fontSize: 11, color: "#64748b" }}>
											{v.count} event{v.count !== 1 ? "s" : ""}
										</span>
										<span style={{ fontSize: 11, color: "#475569" }}>
											cap. {v.capacity}
										</span>
									</div>
								</div>
								<div className="progress-bar">
									<div
										className="progress-fill"
										style={{
											width: `${pct}%`,
											background: "linear-gradient(90deg,#c084fc,#818cf8)",
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="card" style={{ padding: 24 }}>
				<div style={{ fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
					Organizer Leaderboard
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
					{users
						.filter((u) =>
							[ROLES.ORGANIZER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(
								u.role,
							),
						)
						.map((u) => {
							const orgEvents = events.filter((e) => e.organizerId === u.id);
							return (
								<div
									key={u.id}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 14,
										padding: "12px 16px",
										background: "rgba(255,255,255,0.02)",
										borderRadius: 10,
									}}
								>
									<div
										style={{
											width: 36,
											height: 36,
											background: "linear-gradient(135deg,#c084fc,#818cf8)",
											borderRadius: "50%",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: 12,
											fontWeight: 700,
											flexShrink: 0,
										}}
									>
										{u.avatar}
									</div>
									<div style={{ flex: 1 }}>
										<div style={{ fontSize: 13, fontWeight: 600 }}>
											{u.name}
										</div>
										<div style={{ fontSize: 11, color: "#475569" }}>
											{u.department} · {u.role}
										</div>
									</div>
									<div style={{ textAlign: "right" }}>
										<div
											style={{
												fontSize: 16,
												fontWeight: 700,
												color: "#c084fc",
											}}
										>
											{orgEvents.length}
										</div>
										<div style={{ fontSize: 10, color: "#475569" }}>events</div>
									</div>
								</div>
							);
						})}
				</div>
			</div>
		</div>
	);
}

export default AnalyticsPage;
