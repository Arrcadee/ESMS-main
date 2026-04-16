// ─── DONUT CHART COMPONENT ────────────────────────────────────────────────────

function DonutChart({ segments }) {
	const total = segments.reduce((s, x) => s + x.value, 0) || 1;
	let cumulative = 0;
	const r = 40,
		cx = 50,
		cy = 50;
	const paths = segments.map((seg) => {
		const pct = seg.value / total;
		const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
		cumulative += pct;
		const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
		const x1 = cx + r * Math.cos(startAngle),
			y1 = cy + r * Math.sin(startAngle);
		const x2 = cx + r * Math.cos(endAngle),
			y2 = cy + r * Math.sin(endAngle);
		const largeArc = pct > 0.5 ? 1 : 0;
		return {
			d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`,
			color: seg.color,
			label: seg.label,
			value: seg.value,
		};
	});
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
			<svg width={100} height={100} viewBox="0 0 100 100">
				{paths.map((p, i) => (
					<path key={i} d={p.d} fill={p.color} opacity={0.85} />
				))}
				<circle cx={cx} cy={cy} r={22} fill="#1a1a2e" />
				<text
					x={cx}
					y={cy + 4}
					textAnchor="middle"
					fill="#e2e8f0"
					fontSize={11}
					fontWeight="700"
				>
					{total}
				</text>
			</svg>
			<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
				{segments.map((s, i) => (
					<div
						key={i}
						style={{ display: "flex", alignItems: "center", gap: 8 }}
					>
						<div
							style={{
								width: 10,
								height: 10,
								borderRadius: 2,
								background: s.color,
								flexShrink: 0,
							}}
						/>
						<span style={{ fontSize: 11, color: "#94a3b8" }}>{s.label}</span>
						<span
							style={{
								fontSize: 11,
								color: "#e2e8f0",
								fontWeight: 600,
								marginLeft: "auto",
							}}
						>
							{s.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

export default DonutChart;
