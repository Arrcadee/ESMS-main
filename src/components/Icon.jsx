// ─── ICON COMPONENT ───────────────────────────────────────────────────────────

import { ICON_PATHS } from "../data/constants.js";

function Icon({ name, size = 16 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={ICON_PATHS[name] || ICON_PATHS.info} />
		</svg>
	);
}

export default Icon;
