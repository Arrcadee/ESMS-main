// ─── EVENTS PAGE ──────────────────────────────────────────────────────────────

import { useState } from "react";
import { CATEGORIES, STATUSES, ROLES } from "../data/constants.js";
import Icon from "../components/Icon.jsx";
import EventCard from "../components/EventCard.jsx";

function EventsPage({
	events,
	venues,
	users,
	currentUser,
	canManageEvent,
	setModal,
	filters,
	setFilters,
}) {
	const [showFilters, setShowFilters] = useState(false);
	const activeFilterCount = Object.values(filters).filter(Boolean).length;
	const clearFilters = () =>
		setFilters({
			status: "",
			category: "",
			venue: "",
			dateFrom: "",
			dateTo: "",
		});
	const canCreate = [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(
		currentUser?.role,
	);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
						Events
					</h1>
					<p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
						{events.length} event{events.length !== 1 ? "s" : ""} found
					</p>
				</div>
				<div style={{ display: "flex", gap: 10 }}>
					<button
						className="btn"
						onClick={() => setShowFilters((v) => !v)}
						style={{
							background: showFilters
								? "rgba(192,132,252,0.15)"
								: "rgba(255,255,255,0.05)",
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: 10,
							padding: "8px 16px",
							color: showFilters ? "#c084fc" : "#94a3b8",
							fontSize: 13,
							display: "flex",
							alignItems: "center",
							gap: 8,
						}}
					>
						<Icon name="filter" size={15} /> Filters
						{activeFilterCount > 0 && (
							<span
								style={{
									background: "#c084fc",
									color: "#fff",
									borderRadius: 10,
									padding: "0 6px",
									fontSize: 10,
								}}
							>
								{activeFilterCount}
							</span>
						)}
					</button>
					{canCreate && (
						<button
							className="btn"
							onClick={() => setModal({ type: "createEvent" })}
							style={{
								background: "linear-gradient(135deg,#c084fc,#818cf8)",
								color: "#fff",
								padding: "8px 18px",
								borderRadius: 10,
								fontWeight: 600,
								fontSize: 13,
								display: "flex",
								alignItems: "center",
								gap: 8,
							}}
						>
							<Icon name="plus" size={15} /> New Event
						</button>
					)}
				</div>
			</div>

			{showFilters && (
				<div className="card" style={{ padding: 20 }}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
							gap: 14,
						}}
					>
						{[
							{
								label: "STATUS",
								key: "status",
								options: Object.values(STATUSES).map((s) => ({
									v: s,
									l: s.charAt(0).toUpperCase() + s.slice(1),
								})),
							},
							{
								label: "CATEGORY",
								key: "category",
								options: CATEGORIES.map((c) => ({ v: c, l: c })),
							},
						].map((f) => (
							<div key={f.key}>
								<label
									style={{
										fontSize: 11,
										color: "#64748b",
										fontWeight: 600,
										display: "block",
										marginBottom: 6,
									}}
								>
									{f.label}
								</label>
								<select
									className="input-field"
									value={filters[f.key]}
									onChange={(e) =>
										setFilters((p) => ({ ...p, [f.key]: e.target.value }))
									}
								>
									<option value="">All {f.label.toLowerCase()}es</option>
									{f.options.map((o) => (
										<option key={o.v} value={o.v}>
											{o.l}
										</option>
									))}
								</select>
							</div>
						))}
						<div>
							<label
								style={{
									fontSize: 11,
									color: "#64748b",
									fontWeight: 600,
									display: "block",
									marginBottom: 6,
								}}
							>
								VENUE
							</label>
							<select
								className="input-field"
								value={filters.venue}
								onChange={(e) =>
									setFilters((p) => ({ ...p, venue: e.target.value }))
								}
							>
								<option value="">All venues</option>
								{venues.map((v) => (
									<option key={v.id} value={v.id}>
										{v.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label
								style={{
									fontSize: 11,
									color: "#64748b",
									fontWeight: 600,
									display: "block",
									marginBottom: 6,
								}}
							>
								FROM DATE
							</label>
							<input
								className="input-field"
								type="date"
								value={filters.dateFrom}
								onChange={(e) =>
									setFilters((p) => ({ ...p, dateFrom: e.target.value }))
								}
							/>
						</div>
						<div>
							<label
								style={{
									fontSize: 11,
									color: "#64748b",
									fontWeight: 600,
									display: "block",
									marginBottom: 6,
								}}
							>
								TO DATE
							</label>
							<input
								className="input-field"
								type="date"
								value={filters.dateTo}
								onChange={(e) =>
									setFilters((p) => ({ ...p, dateTo: e.target.value }))
								}
							/>
						</div>
						{activeFilterCount > 0 && (
							<div style={{ display: "flex", alignItems: "flex-end" }}>
								<button
									className="btn"
									onClick={clearFilters}
									style={{
										background: "rgba(239,68,68,0.1)",
										border: "1px solid rgba(239,68,68,0.2)",
										borderRadius: 8,
										padding: "10px 16px",
										color: "#ef4444",
										fontSize: 13,
										width: "100%",
									}}
								>
									Clear Filters
								</button>
							</div>
						)}
					</div>
				</div>
			)}

			{events.length === 0 ? (
				<div
					style={{
						textAlign: "center",
						padding: "60px 20px",
						color: "#475569",
					}}
				>
					<div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
					<div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
						No events found
					</div>
					<div style={{ fontSize: 13 }}>
						Try adjusting your filters or create a new event.
					</div>
				</div>
			) : (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
						gap: 16,
					}}
				>
					{events.map((ev) => (
						<EventCard
							key={ev.id}
							event={ev}
							venues={venues}
							users={users}
							onClick={() => setModal({ type: "viewEvent", event: ev })}
							canManage={canManageEvent(ev)}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default EventsPage;
