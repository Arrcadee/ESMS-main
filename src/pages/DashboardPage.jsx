// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

import { useMemo } from "react";
import { STATUSES, ROLES } from "../data/constants.js";
import { fmtDate } from "../utils/dateUtils.js";
import Icon from "../components/Icon.jsx";
import EventMiniCard from "../components/EventMiniCard.jsx";
import BarChart from "../components/BarChart.jsx";
import DonutChart from "../components/DonutChart.jsx";

function DashboardPage({
	events,
	users,
	venues,
	currentUser,
	setActiveNav,
	setModal,
}) {
	const stats = useMemo(
		() => ({
			total: events.length,
			approved: events.filter((e) => e.status === STATUSES.APPROVED).length,
			pending: events.filter((e) => e.status === STATUSES.PENDING).length,
			rejected: events.filter((e) => e.status === STATUSES.REJECTED).length,
			completed: events.filter((e) => e.status === STATUSES.COMPLETED).length,
			upcoming: events.filter(
				(e) => e.date >= fmtDate(new Date()) && e.status === STATUSES.APPROVED,
			).length,
		}),
		[events],
	);

	const upcoming = events
		.filter(
			(e) => e.date >= fmtDate(new Date()) && e.status === STATUSES.APPROVED,
		)
		.slice(0, 4);
	const pending = events
		.filter((e) => e.status === STATUSES.PENDING)
		.slice(0, 3);

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
	const monthlyData = months.map((label, i) => ({
		label,
		value: events.filter((e) => new Date(e.date).getMonth() === i).length,
	}));

	const canCreate = [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(
		currentUser?.role,
	);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<div>
					<h1
						style={{
							fontFamily: "'Syne',sans-serif",
							fontSize: 26,
							fontWeight: 800,
							color: "#f1f5f9",
						}}
					>
						Dashboard
					</h1>
					<p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
						{new Date().toLocaleDateString("en-GB", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
				</div>
				{canCreate && (
					<button
						className="btn"
						onClick={() => setModal({ type: "createEvent" })}
						style={{
							background: "linear-gradient(135deg,#c084fc,#818cf8)",
							color: "#fff",
							padding: "10px 20px",
							borderRadius: 10,
							fontWeight: 600,
							fontSize: 13,
							display: "flex",
							alignItems: "center",
							gap: 8,
						}}
					>
						<Icon name="plus" size={16} /> New Event
					</button>
				)}
			</div>

			{/* STAT CARDS */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
					gap: 16,
				}}
			>
				{[
					{
						label: "Total Events",
						value: stats.total,
						color: "#818cf8",
						icon: "events",
					},
					{
						label: "Approved",
						value: stats.approved,
						color: "#10b981",
						icon: "check",
					},
					{
						label: "Pending",
						value: stats.pending,
						color: "#f59e0b",
						icon: "clock",
					},
					{
						label: "Upcoming",
						value: stats.upcoming,
						color: "#c084fc",
						icon: "calendar",
					},
					{
						label: "Completed",
						value: stats.completed,
						color: "#6366f1",
						icon: "tag",
					},
				].map((s) => (
					<div key={s.label} className="stat-card">
						<div style={{ marginBottom: 12 }}>
							<div
								style={{
									width: 36,
									height: 36,
									background: `${s.color}18`,
									borderRadius: 10,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: s.color,
								}}
							>
								<Icon name={s.icon} size={18} />
							</div>
						</div>
						<div
							style={{
								fontSize: 30,
								fontWeight: 700,
								color: "#f1f5f9",
								fontFamily: "'Syne',sans-serif",
							}}
						>
							{s.value}
						</div>
						<div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
							{s.label}
						</div>
					</div>
				))}
			</div>

			<div
				style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}
			>
				{/* UPCOMING EVENTS */}
				<div className="card" style={{ padding: 24 }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 18,
						}}
					>
						<h3 style={{ fontWeight: 700, fontSize: 15 }}>
							Upcoming Approved Events
						</h3>
						<button
							className="btn"
							onClick={() => setActiveNav("events")}
							style={{
								fontSize: 12,
								color: "#c084fc",
								background: "none",
								border: "none",
							}}
						>
							View all →
						</button>
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						{upcoming.length === 0 ? (
							<div
								style={{
									color: "#475569",
									fontSize: 13,
									textAlign: "center",
									padding: 20,
								}}
							>
								No upcoming events
							</div>
						) : (
							upcoming.map((ev) => (
								<EventMiniCard
									key={ev.id}
									event={ev}
									onClick={() => setModal({ type: "viewEvent", event: ev })}
								/>
							))
						)}
					</div>
				</div>

				{/* CHARTS */}
				<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
					<div className="card" style={{ padding: 20 }}>
						<div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
							Monthly Activity
						</div>
						<BarChart
							data={monthlyData.slice(
								Math.max(0, new Date().getMonth() - 5),
								new Date().getMonth() + 1,
							)}
							color="#c084fc"
						/>
					</div>
					<div className="card" style={{ padding: 20 }}>
						<div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
							Event Status
						</div>
						<DonutChart
							segments={[
								{ label: "Approved", value: stats.approved, color: "#10b981" },
								{ label: "Pending", value: stats.pending, color: "#f59e0b" },
								{
									label: "Completed",
									value: stats.completed,
									color: "#6366f1",
								},
								{ label: "Rejected", value: stats.rejected, color: "#ef4444" },
							]}
						/>
					</div>
				</div>
			</div>

			{/* PENDING APPROVALS WIDGET */}
			{currentUser?.role !== ROLES.USER && pending.length > 0 && (
				<div className="card" style={{ padding: 24 }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 18,
						}}
					>
						<h3 style={{ fontWeight: 700, fontSize: 15 }}>
							Pending Approvals{" "}
							<span
								style={{
									background: "rgba(245,158,11,0.15)",
									color: "#f59e0b",
									borderRadius: 6,
									padding: "2px 8px",
									fontSize: 12,
								}}
							>
								{pending.length}
							</span>
						</h3>
						<button
							className="btn"
							onClick={() => setActiveNav("approvals")}
							style={{
								fontSize: 12,
								color: "#c084fc",
								background: "none",
								border: "none",
							}}
						>
							View all →
						</button>
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						{pending.map((ev) => (
							<EventMiniCard
								key={ev.id}
								event={ev}
								onClick={() => setModal({ type: "approveReject", event: ev })}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export default DashboardPage;
