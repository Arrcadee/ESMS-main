// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────

// import { useState } from "react";
// import { ROLES } from "../data/constants.js";
import Icon from "../components/Icon.jsx";

function AuthScreen({
	page,
	setPage,
	loginForm,
	setLoginForm,
	registerForm,
	setRegisterForm,
	handleLogin,
	handleRegister,
}) {
	const demoAccounts = [
		{ label: "Super Admin", email: "admin@esms.edu", pass: "admin123" },
		{ label: "Admin", email: "e.nwachukwu@esms.edu", pass: "pass123" },
		{ label: "Organizer", email: "c.eze@esms.edu", pass: "pass123" },
		{ label: "User", email: "n.amadi@esms.edu", pass: "pass123" },
	];

	return (
		<div
			style={{
				minHeight: "100vh",
				background: "#0f0f23",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 20,
				fontFamily: "'DM Sans',sans-serif",
			}}
		>
			<div
				style={{
					display: "grid",
					gridTemplateRows: "1fr 1fr",
					gap: 40,
					maxWidth: 900,
					width: "100%",
					alignItems: "center",
				}}
			>
				{/* BRANDING */}
				<div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 14,
							marginBottom: 32,
						}}
					>
						<div
							style={{
								width: 52,
								height: 52,
								background: "linear-gradient(135deg,#c084fc,#818cf8)",
								borderRadius: 16,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Icon name="calendar" size={28} />
						</div>
						<div>
							<div
								style={{
									fontFamily: "'Syne',sans-serif",
									fontSize: 28,
									fontWeight: 800,
									color: "#f1f5f9",
								}}
							>
								ESMS
							</div>
							<div style={{ fontSize: 12, color: "#475569" }}>
								Event Scheduling Management System
							</div>
						</div>
					</div>
					<h1
						style={{
							fontFamily: "'Syne',sans-serif",
							fontSize: 36,
							fontWeight: 800,
							color: "#f1f5f9",
							lineHeight: 1.2,
							marginBottom: 16,
						}}
					>
						Streamline Every
						<br />
						<span style={{ color: "#c084fc" }}>Event.</span>
					</h1>
					<p
						style={{
							color: "#64748b",
							fontSize: 14,
							lineHeight: 1.7,
							marginBottom: 28,
						}}
					>
						Centralized scheduling, intelligent conflict detection, multi-level
						approvals, and real-time analytics — all in one platform.
					</p>

					<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
						<div
							style={{
								fontSize: 11,
								color: "#475569",
								fontWeight: 600,
								marginBottom: 4,
								letterSpacing: "0.05em",
							}}
						>
							DEMO ACCOUNTS
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 8,
							}}
						>
							{demoAccounts.map((d) => (
								<button
									key={d.label}
									className="btn"
									onClick={() =>
										setLoginForm({
											email: d.email,
											password: d.pass,
											error: "",
										})
									}
									style={{
										background: "rgba(192,132,252,0.08)",
										border: "1px solid rgba(192,132,252,0.2)",
										borderRadius: 8,
										padding: "8px 12px",
										color: "#c084fc",
										fontSize: 12,
										fontWeight: 600,
										textAlign: "left",
									}}
								>
									{d.label}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* FORM CARD */}
				<div
					style={{
						background: "#1a1a2e",
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 20,
						padding: 32,
					}}
				>
					<div
						style={{
							display: "flex",
							gap: 0,
							marginBottom: 28,
							background: "rgba(255,255,255,0.04)",
							borderRadius: 10,
							padding: 4,
						}}
					>
						{["login", "register"].map((p) => (
							<button
								key={p}
								className="btn"
								onClick={() => setPage(p)}
								style={{
									flex: 1,
									padding: "8px",
									borderRadius: 8,
									background:
										page === p ? "rgba(192,132,252,0.2)" : "transparent",
									color: page === p ? "#c084fc" : "#475569",
									fontSize: 13,
									fontWeight: 600,
								}}
							>
								{p === "login" ? "Sign In" : "Register"}
							</button>
						))}
					</div>

					{page === "login" ? (
						<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
							{[
								{
									label: "EMAIL ADDRESS",
									key: "email",
									type: "email",
									placeholder: "you@esms.edu",
								},
								{
									label: "PASSWORD",
									key: "password",
									type: "password",
									placeholder: "••••••••",
								},
							].map((f) => (
								<div key={f.key}>
									<label
										style={{
											fontSize: 12,
											color: "#64748b",
											fontWeight: 600,
											display: "block",
											marginBottom: 6,
											letterSpacing: "0.05em",
										}}
									>
										{f.label}
									</label>
									<input
										className="input-field"
										type={f.type}
										placeholder={f.placeholder}
										value={loginForm[f.key]}
										onChange={(e) =>
											setLoginForm((p) => ({
												...p,
												[f.key]: e.target.value,
												error: "",
											}))
										}
										onKeyDown={(e) => e.key === "Enter" && handleLogin()}
									/>
								</div>
							))}
							{loginForm.error && (
								<div style={{ color: "#ef4444", fontSize: 12 }}>
									{loginForm.error}
								</div>
							)}
							<button
								className="btn"
								onClick={handleLogin}
								style={{
									background: "linear-gradient(135deg,#c084fc,#818cf8)",
									color: "#fff",
									padding: "12px",
									borderRadius: 10,
									fontWeight: 700,
									fontSize: 14,
									marginTop: 4,
								}}
							>
								Sign In
							</button>
						</div>
					) : (
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							{[
								{
									label: "FULL NAME",
									key: "name",
									type: "text",
									placeholder: "Your full name",
								},
								{
									label: "EMAIL ADDRESS",
									key: "email",
									type: "email",
									placeholder: "you@esms.edu",
								},
								{
									label: "PASSWORD",
									key: "password",
									type: "password",
									placeholder: "••••••••",
								},
								{
									label: "DEPARTMENT",
									key: "department",
									type: "text",
									placeholder: "Your department",
								},
							].map((f) => (
								<div key={f.key}>
									<label
										style={{
											fontSize: 12,
											color: "#64748b",
											fontWeight: 600,
											display: "block",
											marginBottom: 6,
											letterSpacing: "0.05em",
										}}
									>
										{f.label}
									</label>
									<input
										className="input-field"
										type={f.type}
										placeholder={f.placeholder}
										value={registerForm[f.key]}
										onChange={(e) =>
											setRegisterForm((p) => ({
												...p,
												[f.key]: e.target.value,
												error: "",
											}))
										}
									/>
								</div>
							))}
							{registerForm.error && (
								<div style={{ color: "#ef4444", fontSize: 12 }}>
									{registerForm.error}
								</div>
							)}
							<button
								className="btn"
								onClick={handleRegister}
								style={{
									background: "linear-gradient(135deg,#c084fc,#818cf8)",
									color: "#fff",
									padding: "12px",
									borderRadius: 10,
									fontWeight: 700,
									fontSize: 14,
								}}
							>
								Create Account
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default AuthScreen;
