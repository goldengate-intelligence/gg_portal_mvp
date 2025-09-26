import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Centralized color theme for contractor-detail page
export const CONTRACTOR_DETAIL_COLORS = {
	bannerColor: "#000102", // Top and bottom fixed banners
	backgroundColor: "bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90", // Main page background matching portfolio
	panelColor: "bg-black/80 backdrop-blur-sm", // Cards/panels hovering on top of background (solid obsidian)
	panelColorHex: "#111827", // Cards/panels hovering on top of background (hex color - gray-900)
	containerColor: "#223040", // Elements inside panels (Executive Summary text, charts, network graphs, etc.)
};
