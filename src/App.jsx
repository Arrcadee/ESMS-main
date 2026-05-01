import "./styles/global.css";
import { useState, useCallback, useMemo, useEffect } from "react";

// ─── IMPORTS ──────────────────────────────────────────────────────────────────
import { ROLES, STATUSES } from "./data/constants.js";
import {
	initialUsers,
	initialVenues,
	initialEvents,
	initialNotifications,
} from "./data/seed.js";
import { fmtDate } from "./utils/dateUtils.js";
import {
	detectConflicts,
} from "./utils/eventUtils.js";
import {
	authAPI,
	userAPI,
	eventAPI,
	venueAPI,
	approvalAPI,
	setAuthToken,
	getAuthToken,
	clearAuthToken,
} from "./utils/api.js";

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
import Icon from "./components/Icon.jsx";

// ─── MODALS ───────────────────────────────────────────────────────────────────
import AuthScreen from "./modals/AuthScreen.jsx";
import EventFormModal from "./modals/EventFormModal.jsx";
import EventDetailModal from "./modals/EventDetailModal.jsx";
import ApprovalModal from "./modals/ApprovalModal.jsx";
import ConfirmModal from "./modals/ConfirmModal.jsx";

// ─── PAGES ────────────────────────────────────────────────────────────────────
import DashboardPage from "./pages/DashboardPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import ApprovalsPage from "./pages/ApprovalsPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import VenuesPage from "./pages/VenuesPage.jsx";

// ─── ROOT APP COMPONENT ───────────────────────────────────────────────────────

export default function App() {
	const [users, setUsers] = useState(initialUsers);
	const [events, setEvents] = useState(initialEvents);
	const [venues, setVenues] = useState(initialVenues);
	const [notifications, setNotifications] = useState(initialNotifications);
	const [currentUser, setCurrentUser] = useState(null);
	const [page, setPage] = useState("login");
	const [activeNav, setActiveNav] = useState("dashboard");
	const [modal, setModal] = useState(null);
	const [toast, setToast] = useState(null);
	const [loginForm, setLoginForm] = useState({
		email: "",
		password: "",
		error: "",
	});
	const [registerForm, setRegisterForm] = useState({
		name: "",
		email: "",
		password: "",
		department: "",
		role: ROLES.USER,
		error: "",
	});
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [calendarDate, setCalendarDate] = useState(new Date());
	const [calendarView, setCalendarView] = useState("month");
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState({
		status: "",
		category: "",
		venue: "",
		dateFrom: "",
		dateTo: "",
	});
	const [notifOpen, setNotifOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	// ── INITIALIZATION ──────────────────────────────────────────────────────────

	useEffect(() => {
		// Check if user is logged in
		const token = getAuthToken();
		if (token) {
			setPage("app");
		}
	}, []);

	// Fetch app data when user logs in
	useEffect(() => {
		if (page === "app" && currentUser) {
			const fetchAppData = async () => {
				setLoading(true);
				try {
					const [usersResp, eventsResp, venuesResp] = await Promise.allSettled([
						userAPI.getAllUsers(),
						eventAPI.getAllEvents(),
						venueAPI.getAllVenues(),
					]);

					// Handle responses - fall back to initial data if API fails
					if (usersResp.status === "fulfilled") {
						setUsers(usersResp.value || initialUsers);
					}
					if (eventsResp.status === "fulfilled") {
						setEvents(eventsResp.value || initialEvents);
					}
					if (venuesResp.status === "fulfilled") {
						setVenues(venuesResp.value || initialVenues);
					}
				} catch (error) {
					console.error("Error fetching app data:", error);
					// Keep using initial data on error
				} finally {
					setLoading(false);
				}
			};

			fetchAppData();
		}
	}, [page, currentUser]);

	// ── HELPERS ──────────────────────────────────────────────────────────────────

	const showToast = useCallback((msg, type = "success") => {
		setToast({ msg, type });
		setTimeout(() => setToast(null), 3500);
	}, []);

	const addNotification = useCallback(
		(userId, type, title, message, eventId = null) => {
			setNotifications((prev) => [
				...prev,
				{
					id: Date.now(),
					userId,
					type,
					title,
					message,
					eventId,
					read: false,
					createdAt: fmtDate(new Date()),
				},
			]);
		},
		[],
	);

	const userNotifs = useMemo(
		() =>
			notifications
				.filter((n) => n.userId === currentUser?.id)
				.sort((a, b) => b.id - a.id),
		[notifications, currentUser],
	);
	const unreadCount = userNotifs.filter((n) => !n.read).length;

	// ── AUTH ──────────────────────────────────────────────────────────────────────

	const handleLogin = async () => {
		setLoginForm((f) => ({ ...f, error: "" }));
		try {
			const response = await authAPI.login(loginForm.email, loginForm.password);
			if (response.token && response.user) {
				setAuthToken(response.token);
				setCurrentUser(response.user);
				setPage("app");
				setActiveNav("dashboard");
				showToast(`Welcome back, ${response.user.name.split(" ")[0]}!`);
			}
		} catch (err) {
			setLoginForm((f) => ({ ...f, error: err.message || "Login failed. Please try again." }));
		}
	};

	const handleRegister = async () => {
		setRegisterForm((f) => ({ ...f, error: "" }));
		if (!registerForm.name || !registerForm.email || !registerForm.password) {
			setRegisterForm((f) => ({ ...f, error: "All fields are required." }));
			return;
		}
		try {
			const response = await authAPI.register(
				registerForm.name,
				registerForm.email,
				registerForm.password,
				registerForm.department,
				registerForm.role
			);
			if (response.token && response.user) {
				setAuthToken(response.token);
				setCurrentUser(response.user);
				setPage("app");
				setActiveNav("dashboard");
				showToast("Account created! Welcome to ESMS.");
			}
		} catch (err) {
			setRegisterForm((f) => ({ ...f, error: err.message || "Registration failed. Please try again." }));
		}
	};

	const handleLogout = () => {
		clearAuthToken();
		setCurrentUser(null);
		setPage("login");
		setLoginForm({ email: "", password: "", error: "" });
	};

	// ── EVENTS ────────────────────────────────────────────────────────────────────

	const handleSaveEvent = useCallback(
		async (data, editId = null) => {
			const conflicts = detectConflicts(events, data, editId);
			if (conflicts.length > 0) {
				showToast(`Conflict detected with "${conflicts[0].title}"`, "error");
				return false;
			}

			try {
				if (editId) {
					// Update existing event
					const updated = await eventAPI.updateEvent(editId, {
						...data,
					});
					setEvents((prev) =>
						prev.map((e) => (e.id === editId ? updated : e)),
					);
					showToast("Event updated successfully.");
				} else {
					// Create new event
					const newEvent = await eventAPI.createEvent({
						...data,
						organizerId: currentUser.id,
					});
					setEvents((prev) => [...prev, newEvent]);
					users
						.filter((u) => u.role === ROLES.ADMIN || u.role === ROLES.SUPER_ADMIN)
						.forEach((admin) =>
							addNotification(
								admin.id,
								"submission",
								"New Event Submitted",
								`"${data.title}" submitted for approval.`,
								newEvent.id,
							),
						);
					showToast("Event submitted for approval!");
				}
				return true;
			} catch (error) {
				showToast(`Error saving event: ${error.message}`, "error");
				return false;
			}
		},
		[events, currentUser, users, addNotification, showToast],
	);

	const handleDeleteEvent = useCallback(
		async (id) => {
			try {
				await eventAPI.deleteEvent(id);
				setEvents((prev) => prev.filter((e) => e.id !== id));
				showToast("Event deleted.");
				setModal(null);
			} catch (error) {
				showToast(`Error deleting event: ${error.message}`, "error");
			}
		},
		[showToast],
	);

	const handleApprove = useCallback(
		async (id, note = "") => {
			try {
				await approvalAPI.approveEvent(id, note);
				const ev = events.find((e) => e.id === id);
				setEvents((prev) =>
					prev.map((e) =>
						e.id === id
							? {
									...e,
									status: STATUSES.APPROVED,
									approvedBy: currentUser.id,
									approvalNote: note,
								}
							: e,
					),
				);
				addNotification(
					ev.organizerId,
					"approval",
					"Event Approved",
					`"${ev.title}" has been approved.`,
					id,
				);
				showToast("Event approved!");
				setModal(null);
			} catch (error) {
				showToast(`Error approving event: ${error.message}`, "error");
			}
		},
		[events, currentUser, addNotification, showToast],
	);

	const handleReject = useCallback(
		async (id, note) => {
			try {
				await approvalAPI.rejectEvent(id, note);
				const ev = events.find((e) => e.id === id);
				setEvents((prev) =>
					prev.map((e) =>
						e.id === id
							? {
									...e,
									status: STATUSES.REJECTED,
									approvedBy: currentUser.id,
									approvalNote: note,
								}
							: e,
					),
				);
				addNotification(
					ev.organizerId,
					"rejection",
					"Event Rejected",
					`"${ev.title}" was rejected: ${note}`,
					id,
				);
				showToast("Event rejected.", "warning");
				setModal(null);
			} catch (error) {
				showToast(`Error rejecting event: ${error.message}`, "error");
			}
		},
		[events, currentUser, addNotification, showToast],
	);

	const markAllRead = () =>
		setNotifications((prev) =>
			prev.map((n) => (n.userId === currentUser.id ? { ...n, read: true } : n)),
		);

	// ── PERMISSIONS ───────────────────────────────────────────────────────────────

	const canManageEvent = useCallback(
		(ev) => {
			if (!currentUser) return false;
			if (
				currentUser.role === ROLES.SUPER_ADMIN ||
				currentUser.role === ROLES.ADMIN
			)
				return true;
			return ev.organizerId === currentUser.id;
		},
		[currentUser],
	);

	// ── FILTERED EVENTS ───────────────────────────────────────────────────────────

	const visibleEvents = useMemo(() => {
		let ev = events;
		if (currentUser?.role === ROLES.USER)
			ev = ev.filter(
				(e) =>
					e.status === STATUSES.APPROVED || e.organizerId === currentUser.id,
			);
		if (search)
			ev = ev.filter(
				(e) =>
					e.title.toLowerCase().includes(search.toLowerCase()) ||
					e.description.toLowerCase().includes(search.toLowerCase()) ||
					e.category.toLowerCase().includes(search.toLowerCase()),
			);
		if (filters.status) ev = ev.filter((e) => e.status === filters.status);
		if (filters.category)
			ev = ev.filter((e) => e.category === filters.category);
		if (filters.venue)
			ev = ev.filter((e) => e.venueId === parseInt(filters.venue));
		if (filters.dateFrom) ev = ev.filter((e) => e.date >= filters.dateFrom);
		if (filters.dateTo) ev = ev.filter((e) => e.date <= filters.dateTo);
		return ev.sort((a, b) => new Date(a.date) - new Date(b.date));
	}, [events, currentUser, search, filters]);

	const pendingEvents = useMemo(
		() => events.filter((e) => e.status === STATUSES.PENDING),
		[events],
	);

	// ── RENDER: AUTH ──────────────────────────────────────────────────────────────

	if (page === "login" || page === "register") {
		return (
			<AuthScreen
				page={page}
				setPage={setPage}
				loginForm={loginForm}
				setLoginForm={setLoginForm}
				registerForm={registerForm}
				setRegisterForm={setRegisterForm}
				handleLogin={handleLogin}
				handleRegister={handleRegister}
			/>
		);
	}

	// ── RENDER: APP ───────────────────────────────────────────────────────────────

	const navItems = [
		{ id: "dashboard", icon: "dashboard", label: "Dashboard" },
		{ id: "events", icon: "events", label: "Events" },
		{ id: "calendar", icon: "calendar", label: "Calendar" },
		...(currentUser?.role !== ROLES.USER
			? [
					{
						id: "approvals",
						icon: "approval",
						label: "Approvals",
						badge: pendingEvents.length,
					},
				]
			: []),
		{ id: "analytics", icon: "analytics", label: "Analytics" },
		...(currentUser?.role === ROLES.SUPER_ADMIN
			? [{ id: "users", icon: "users", label: "Users" }]
			: []),
		{ id: "venues", icon: "venue", label: "Venues" },
	];

	return (
		<div
			style={{
				display: "flex",
				height: "100vh",
				background: "#0f0f23",
				color: "#e2e8f0",
				fontFamily: "'DM Sans','Segoe UI',sans-serif",
				overflow: "hidden",
			}}
		>
			{/* ── SIDEBAR ── */}
			<div
				style={{
					width: sidebarOpen ? 240 : 64,
					transition: "width 0.3s ease",
					background: "#12122a",
					borderRight: "1px solid rgba(255,255,255,0.06)",
					display: "flex",
					flexDirection: "column",
					flexShrink: 0,
				}}
			>
				<div
					style={{
						padding: "20px 16px",
						borderBottom: "1px solid rgba(255,255,255,0.06)",
						display: "flex",
						alignItems: "center",
						gap: 10,
					}}
				>
					<div
						style={{
							width: 34,
							height: 34,
							background: "linear-gradient(135deg,#c084fc,#818cf8)",
							borderRadius: 10,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}
					>
						<Icon name="calendar" size={18} />
					</div>
					{sidebarOpen && (
						<div>
							<div
								style={{
									fontFamily: "'Syne',sans-serif",
									fontSize: 15,
									fontWeight: 800,
									color: "#f1f5f9",
								}}
							>
								ESMS
							</div>
							<div style={{ fontSize: 10, color: "#475569" }}>
								Event Management
							</div>
						</div>
					)}
				</div>

				<nav
					style={{
						flex: 1,
						padding: "12px 8px",
						display: "flex",
						flexDirection: "column",
						gap: 2,
					}}
				>
					{navItems.map((item) => (
						<div
							key={item.id}
							className={`nav-item ${activeNav === item.id ? "active" : ""}`}
							onClick={() => setActiveNav(item.id)}
						>
							<Icon name={item.icon} size={18} />
							{sidebarOpen && (
								<>
									<span style={{ flex: 1 }}>{item.label}</span>
									{item.badge > 0 && (
										<span
											style={{
												background: "#ef4444",
												color: "#fff",
												borderRadius: 10,
												padding: "1px 6px",
												fontSize: 10,
												fontWeight: 700,
											}}
										>
											{item.badge}
										</span>
									)}
								</>
							)}
						</div>
					))}
				</nav>

				<div
					style={{
						padding: "12px 8px",
						borderTop: "1px solid rgba(255,255,255,0.06)",
					}}
				>
					<div className="nav-item" onClick={handleLogout}>
						<Icon name="logout" size={18} />
						{sidebarOpen && <span>Logout</span>}
					</div>
				</div>
			</div>

			{/* ── MAIN COLUMN ── */}
			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
				}}
			>
				{/* TOP BAR */}
				<div
					style={{
						background: "#12122a",
						borderBottom: "1px solid rgba(255,255,255,0.06)",
						padding: "0 24px",
						height: 60,
						display: "flex",
						alignItems: "center",
						gap: 16,
						flexShrink: 0,
					}}
				>
					<button
						className="btn"
						onClick={() => setSidebarOpen((v) => !v)}
						style={{
							background: "rgba(255,255,255,0.05)",
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: 8,
							padding: "6px 10px",
							color: "#94a3b8",
							fontSize: 16,
						}}
					>
						☰
					</button>

					<div style={{ flex: 1, maxWidth: 380, position: "relative" }}>
						<div
							style={{
								position: "absolute",
								left: 12,
								top: "50%",
								transform: "translateY(-50%)",
								color: "#475569",
							}}
						>
							<Icon name="search" size={16} />
						</div>
						<input
							className="input-field"
							style={{ paddingLeft: 36, height: 36 }}
							placeholder="Search events…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<div style={{ flex: 1 }} />

					{/* NOTIFICATION BELL */}
					<div style={{ position: "relative" }}>
						<button
							className="btn"
							onClick={() => setNotifOpen((v) => !v)}
							style={{
								background: "rgba(255,255,255,0.05)",
								border: "1px solid rgba(255,255,255,0.08)",
								borderRadius: 8,
								padding: "6px 10px",
								color: "#94a3b8",
								position: "relative",
							}}
						>
							<Icon name="bell" size={18} />
							{unreadCount > 0 && (
								<span
									style={{
										position: "absolute",
										top: 2,
										right: 2,
										width: 8,
										height: 8,
										background: "#ef4444",
										borderRadius: "50%",
										border: "1.5px solid #12122a",
									}}
								/>
							)}
						</button>

						{notifOpen && (
							<div
								style={{
									position: "absolute",
									right: 0,
									top: "calc(100% + 8px)",
									width: 320,
									background: "#1a1a2e",
									border: "1px solid rgba(255,255,255,0.1)",
									borderRadius: 14,
									zIndex: 500,
									overflow: "hidden",
								}}
							>
								<div
									style={{
										padding: "14px 16px",
										borderBottom: "1px solid rgba(255,255,255,0.06)",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<span style={{ fontWeight: 600 }}>Notifications</span>
									<button
										className="btn"
										onClick={markAllRead}
										style={{
											fontSize: 11,
											color: "#c084fc",
											background: "none",
											border: "none",
										}}
									>
										Mark all read
									</button>
								</div>
								<div style={{ maxHeight: 320, overflowY: "auto" }}>
									{userNotifs.length === 0 ? (
										<div
											style={{
												padding: "20px",
												textAlign: "center",
												color: "#475569",
												fontSize: 13,
											}}
										>
											No notifications
										</div>
									) : (
										userNotifs.map((n) => (
											<div
												key={n.id}
												onClick={() => {
													setNotifications((prev) =>
														prev.map((x) =>
															x.id === n.id ? { ...x, read: true } : x,
														),
													);
													setNotifOpen(false);
												}}
												style={{
													padding: "12px 16px",
													borderBottom: "1px solid rgba(255,255,255,0.04)",
													cursor: "pointer",
													background: n.read
														? "transparent"
														: "rgba(192,132,252,0.05)",
												}}
											>
												<div
													style={{
														display: "flex",
														justifyContent: "space-between",
														gap: 8,
													}}
												>
													<span
														style={{
															fontSize: 13,
															fontWeight: n.read ? 400 : 600,
															color: n.read ? "#94a3b8" : "#e2e8f0",
														}}
													>
														{n.title}
													</span>
													{!n.read && (
														<div
															style={{
																width: 6,
																height: 6,
																background: "#c084fc",
																borderRadius: "50%",
																flexShrink: 0,
																marginTop: 5,
															}}
														/>
													)}
												</div>
												<div
													style={{
														fontSize: 12,
														color: "#64748b",
														marginTop: 2,
													}}
												>
													{n.message}
												</div>
												<div
													style={{
														fontSize: 10,
														color: "#334155",
														marginTop: 4,
													}}
												>
													{n.createdAt}
												</div>
											</div>
										))
									)}
								</div>
							</div>
						)}
					</div>

					{/* USER AVATAR */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 10,
							borderLeft: "1px solid rgba(255,255,255,0.06)",
							paddingLeft: 16,
						}}
					>
						<div
							style={{
								width: 34,
								height: 34,
								background: "linear-gradient(135deg,#c084fc,#818cf8)",
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 12,
								fontWeight: 700,
							}}
						>
							{currentUser?.avatar}
						</div>
						<div>
							<div style={{ fontSize: 13, fontWeight: 600 }}>
								{currentUser?.name.split(" ")[0]}
							</div>
							<div style={{ fontSize: 10, color: "#c084fc" }}>
								{currentUser?.role}
							</div>
						</div>
					</div>
				</div>

				{/* PAGE CONTENT */}
				<div style={{ flex: 1, overflow: "auto", padding: 24 }}>
					{activeNav === "dashboard" && (
						<DashboardPage
							events={events}
							users={users}
							venues={venues}
							currentUser={currentUser}
							setActiveNav={setActiveNav}
							setModal={setModal}
						/>
					)}
					{activeNav === "events" && (
						<EventsPage
							events={visibleEvents}
							venues={venues}
							users={users}
							currentUser={currentUser}
							canManageEvent={canManageEvent}
							setModal={setModal}
							filters={filters}
							setFilters={setFilters}
						/>
					)}
					{activeNav === "calendar" && (
						<CalendarPage
							events={events}
							venues={venues}
							calendarDate={calendarDate}
							setCalendarDate={setCalendarDate}
							calendarView={calendarView}
							setCalendarView={setCalendarView}
							setModal={setModal}
							currentUser={currentUser}
						/>
					)}
					{activeNav === "approvals" && currentUser?.role !== ROLES.USER && (
						<ApprovalsPage
							events={events}
							venues={venues}
							users={users}
							setModal={setModal}
						/>
					)}
					{activeNav === "analytics" && (
						<AnalyticsPage events={events} venues={venues} users={users} />
					)}
					{activeNav === "users" && currentUser?.role === ROLES.SUPER_ADMIN && (
						<UsersPage
							users={users}
							setUsers={setUsers}
							showToast={showToast}
						/>
					)}
					{activeNav === "venues" && (
						<VenuesPage venues={venues} events={events} />
					)}
				</div>
			</div>

			{/* ── MODALS ── */}
			{modal && (
				<div
					className="modal-overlay"
					onClick={(e) => e.target === e.currentTarget && setModal(null)}
				>
					{modal.type === "createEvent" && (
						<EventFormModal
							onClose={() => setModal(null)}
							onSave={handleSaveEvent}
							venues={venues}
							events={events}
							currentUser={currentUser}
							editData={modal.editData}
						/>
					)}
					{modal.type === "viewEvent" && (
						<EventDetailModal
							event={modal.event}
							venues={venues}
							users={users}
							onClose={() => setModal(null)}
							onEdit={(ev) => setModal({ type: "createEvent", editData: ev })}
							onDelete={handleDeleteEvent}
							canManage={canManageEvent(modal.event)}
							onApprove={handleApprove}
							onReject={handleReject}
							currentUser={currentUser}
						/>
					)}
					{modal.type === "approveReject" && (
						<ApprovalModal
							event={modal.event}
							onClose={() => setModal(null)}
							onApprove={handleApprove}
							onReject={handleReject}
							venues={venues}
							users={users}
						/>
					)}
					{modal.type === "confirm" && (
						<ConfirmModal
							message={modal.message}
							onClose={() => setModal(null)}
							onConfirm={modal.onConfirm}
							danger={modal.danger}
						/>
					)}
				</div>
			)}

			{/* ── TOAST ── */}
			{toast && (
				<div
					className="toast"
					style={{
						borderLeftColor:
							toast.type === "error"
								? "#ef4444"
								: toast.type === "warning"
									? "#f59e0b"
									: "#10b981",
						borderLeftWidth: 3,
					}}
				>
					<span
						style={{
							color:
								toast.type === "error"
									? "#ef4444"
									: toast.type === "warning"
										? "#f59e0b"
										: "#10b981",
						}}
					>
						<Icon
							name={
								toast.type === "error"
									? "x"
									: toast.type === "warning"
										? "warning"
										: "check"
							}
							size={16}
						/>
					</span>
					<span style={{ fontSize: 13 }}>{toast.msg}</span>
				</div>
			)}
		</div>
	);
}
