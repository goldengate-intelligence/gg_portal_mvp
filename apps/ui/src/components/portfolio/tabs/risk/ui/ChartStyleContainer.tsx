import type React from "react";

// Chart-Style Container
// IMPORTANT: OFFICIAL GUNMETAL COLOR = #223040
export const ChartStyleContainer = ({
	children,
}: { children: React.ReactNode }) => (
	<div
		className="rounded-lg p-4"
		style={{
			backgroundColor: "#223040",
		}}
	>
		{children}
	</div>
);
