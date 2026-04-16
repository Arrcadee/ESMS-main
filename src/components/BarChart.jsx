// ─── BAR CHART COMPONENT ──────────────────────────────────────────────────────

function BarChart({ data, color = "#c084fc" }) {
	const max = Math.max(...data.map((d) => d.value), 1);
	return (
		<div
			style={{
				display: "flex",
				alignItems: "flex-end",
				gap: 6,
				height: 80,
				padding: "0 4px",
			}}
		>
			{data.map((d, i) => (
				<div
					key={i}
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 4,
					}}
				>
					<div
						style={{
							width: "100%",
							background: `${color}22`,
							borderRadius: 4,
							overflow: "hidden",
							height: 60,
						}}
					>
						<div
							style={{
								width: "100%",
								height: `${(d.value / max) * 100}%`,
								background: color,
								borderRadius: 4,
								marginTop: "auto",
								transition: "height 0.6s ease",
							}}
						/>
					</div>
					<span style={{ fontSize: 9, color: "#94a3b8", whiteSpace: "nowrap" }}>
						{d.label}
					</span>
				</div>
			))}
		</div>
	);
}

export default BarChart;
