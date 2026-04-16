// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────

import Icon from "../components/Icon.jsx";

function ConfirmModal({ message, onClose, onConfirm, danger }) {
	return (
		<div className="modal" style={{ maxWidth: 380 }}>
			<div style={{ textAlign: "center", padding: "8px 0 20px" }}>
				<div
					style={{
						width: 52,
						height: 52,
						background: danger
							? "rgba(239,68,68,0.12)"
							: "rgba(192,132,252,0.12)",
						borderRadius: "50%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						margin: "0 auto 16px",
						color: danger ? "#ef4444" : "#c084fc",
					}}
				>
					<Icon name={danger ? "trash" : "info"} size={24} />
				</div>
				<h3 style={{ fontWeight: 700, marginBottom: 8 }}>Are you sure?</h3>
				<p style={{ fontSize: 13, color: "#64748b" }}>{message}</p>
			</div>
			<div style={{ display: "flex", gap: 12 }}>
				<button
					className="btn"
					onClick={onClose}
					style={{
						flex: 1,
						background: "rgba(255,255,255,0.05)",
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 10,
						padding: 10,
						color: "#94a3b8",
						fontSize: 13,
					}}
				>
					Cancel
				</button>
				<button
					className="btn"
					onClick={() => {
						onConfirm();
						onClose();
					}}
					style={{
						flex: 1,
						background: danger
							? "rgba(239,68,68,0.8)"
							: "linear-gradient(135deg,#c084fc,#818cf8)",
						color: "#fff",
						borderRadius: 10,
						padding: 10,
						fontWeight: 700,
						fontSize: 13,
					}}
				>
					Confirm
				</button>
			</div>
		</div>
	);
}

export default ConfirmModal;
