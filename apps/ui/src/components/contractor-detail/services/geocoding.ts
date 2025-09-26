// Geocoding utilities for contractor location mapping
// Provides ZIP-to-coordinate conversion with state-level fallbacks

export interface Coordinates {
	lat: number;
	lng: number;
}

export interface LocationData {
	zipCode?: string;
	city?: string;
	state: string;
	coordinates: Coordinates;
	precision: "zip" | "city" | "state";
}

// Default state center coordinates (geographic centers or major business centers)
export const STATE_COORDINATES: Record<string, Coordinates> = {
	AL: { lat: 32.361538, lng: -86.279118 }, // Montgomery area
	AK: { lat: 64.0685, lng: -152.2782 }, // Fairbanks area
	AZ: { lat: 33.448457, lng: -112.073844 }, // Phoenix
	AR: { lat: 34.736009, lng: -92.331122 }, // Little Rock
	CA: { lat: 37.367565, lng: -122.036133 }, // Bay Area (tech hub)
	CO: { lat: 39.739236, lng: -104.990251 }, // Denver
	CT: { lat: 41.767, lng: -72.677 }, // Hartford area
	DE: { lat: 39.161921, lng: -75.526755 }, // Wilmington
	FL: { lat: 39.8283, lng: -98.5795 }, // Geographic center of USA
	GA: { lat: 33.76, lng: -84.39 }, // Atlanta
	HI: { lat: 21.30895, lng: -157.826182 }, // Honolulu
	ID: { lat: 43.613739, lng: -116.237651 }, // Boise
	IL: { lat: 41.87194, lng: -87.723404 }, // Chicago
	IN: { lat: 39.790942, lng: -86.147685 }, // Indianapolis
	IA: { lat: 41.590939, lng: -93.620866 }, // Des Moines
	KS: { lat: 39.04, lng: -95.69 }, // Kansas City area
	KY: { lat: 38.197274, lng: -84.86311 }, // Lexington
	LA: { lat: 30.45809, lng: -91.140229 }, // Baton Rouge
	ME: { lat: 45.253783, lng: -69.765261 }, // Augusta
	MD: { lat: 39.045755, lng: -76.641271 }, // Baltimore (major gov contractor hub)
	MA: { lat: 42.2352, lng: -71.0275 }, // Boston area
	MI: { lat: 42.354558, lng: -84.955255 }, // Detroit area
	MN: { lat: 44.95, lng: -93.094 }, // Minneapolis
	MS: { lat: 32.354668, lng: -89.398528 }, // Jackson
	MO: { lat: 39.04, lng: -94.57 }, // Kansas City
	MT: { lat: 46.595805, lng: -110.604516 }, // Great Falls
	NE: { lat: 41.25, lng: -95.995102 }, // Omaha
	NV: { lat: 36.161921, lng: -115.165252 }, // Las Vegas
	NH: { lat: 43.220093, lng: -71.549896 }, // Manchester
	NJ: { lat: 40.221741, lng: -74.756138 }, // Trenton
	NM: { lat: 35.667231, lng: -105.964575 }, // Santa Fe
	NY: { lat: 40.71455, lng: -74.007124 }, // NYC (financial hub)
	NC: { lat: 35.771, lng: -78.638 }, // Raleigh area
	ND: { lat: 46.813343, lng: -100.779004 }, // Bismarck
	OH: { lat: 39.961176, lng: -82.998794 }, // Columbus
	OK: { lat: 35.482309, lng: -97.534994 }, // Oklahoma City
	OR: { lat: 45.533467, lng: -122.650095 }, // Portland
	PA: { lat: 40.269789, lng: -76.875613 }, // Harrisburg
	RI: { lat: 41.82355, lng: -71.422132 }, // Providence
	SC: { lat: 34.0, lng: -81.035 }, // Columbia
	SD: { lat: 44.367966, lng: -100.336378 }, // Pierre
	TN: { lat: 36.165, lng: -86.784 }, // Nashville
	TX: { lat: 32.78306, lng: -96.806671 }, // Dallas area
	UT: { lat: 40.777477, lng: -111.888237 }, // Salt Lake City
	VT: { lat: 44.26639, lng: -72.580536 }, // Montpelier
	VA: { lat: 38.91375, lng: -77.032002 }, // DC Metro (major gov hub)
	WA: { lat: 47.2529, lng: -120.7401 }, // Central Washington
	WV: { lat: 38.349497, lng: -81.633294 }, // Charleston
	WI: { lat: 43.074722, lng: -89.384444 }, // Madison
	WY: { lat: 42.354558, lng: -105.501748 }, // Casper
	DC: { lat: 38.9072, lng: -77.0369 }, // Washington DC
};

// Major metropolitan areas for more precise city-level mapping
export const METRO_COORDINATES: Record<string, Coordinates> = {
	// Major defense/government contractor hubs
	"Washington DC Metro": { lat: 38.9072, lng: -77.0369 },
	"Baltimore MD": { lat: 39.2904, lng: -76.6122 },
	"Norfolk VA": { lat: 36.8508, lng: -76.2859 },
	"San Diego CA": { lat: 32.7157, lng: -117.1611 },
	"Colorado Springs CO": { lat: 38.8339, lng: -104.8214 },
	"Huntsville AL": { lat: 34.7304, lng: -86.5861 },
	"Boston MA": { lat: 42.3601, lng: -71.0589 },
	"Los Angeles CA": { lat: 34.0522, lng: -118.2437 },
	"Chicago IL": { lat: 41.8781, lng: -87.6298 },
	"Dallas TX": { lat: 32.7767, lng: -96.797 },
	"Houston TX": { lat: 29.7604, lng: -95.3698 },
	"Phoenix AZ": { lat: 33.4484, lng: -112.074 },
	"Philadelphia PA": { lat: 39.9526, lng: -75.1652 },
	"San Antonio TX": { lat: 29.4241, lng: -98.4936 },
	"San Francisco CA": { lat: 37.7749, lng: -122.4194 },
	"Seattle WA": { lat: 47.6062, lng: -122.3321 },
	"Denver CO": { lat: 39.7392, lng: -104.9903 },
	"Miami FL": { lat: 25.7617, lng: -80.1918 },
	"Atlanta GA": { lat: 33.749, lng: -84.388 },
};

/**
 * Simple ZIP code to coordinates mapping (subset for demo)
 * In production, you'd use a comprehensive ZIP centroid database
 */
export const ZIP_COORDINATES: Record<string, Coordinates> = {
	// DC Metro area (major gov contractor zone)
	"20001": { lat: 38.9072, lng: -77.0369 }, // DC
	"20002": { lat: 38.8973, lng: -76.9951 }, // DC
	"22202": { lat: 38.8606, lng: -77.05 }, // Arlington VA
	"22101": { lat: 38.8462, lng: -77.247 }, // McLean VA
	"20814": { lat: 39.0458, lng: -77.091 }, // Bethesda MD
	"21201": { lat: 39.2904, lng: -76.6122 }, // Baltimore MD

	// California defense hubs
	"92101": { lat: 32.7157, lng: -117.1611 }, // San Diego CA
	"90210": { lat: 34.0901, lng: -118.4065 }, // Beverly Hills CA
	"94105": { lat: 37.7749, lng: -122.4194 }, // San Francisco CA

	// Texas business centers
	"75201": { lat: 32.7767, lng: -96.797 }, // Dallas TX
	"77002": { lat: 29.7604, lng: -95.3698 }, // Houston TX

	// Colorado Springs (aerospace hub)
	"80903": { lat: 38.8339, lng: -104.8214 }, // Colorado Springs CO

	// Add more as needed...
};

/**
 * Get coordinates for a location with fallback hierarchy:
 * 1. Try ZIP code lookup
 * 2. Try city lookup in metro areas
 * 3. Fall back to state center
 */
export function getLocationCoordinates(
	zipCode?: string,
	city?: string,
	state?: string,
): LocationData | null {
	if (!state) return null;

	// Level 1: Try ZIP code lookup (most precise)
	if (zipCode && ZIP_COORDINATES[zipCode]) {
		return {
			zipCode,
			city,
			state,
			coordinates: ZIP_COORDINATES[zipCode],
			precision: "zip",
		};
	}

	// Level 2: Try city lookup in metro areas
	if (city && state) {
		const cityKey = `${city} ${state}`;
		if (METRO_COORDINATES[cityKey]) {
			return {
				zipCode,
				city,
				state,
				coordinates: METRO_COORDINATES[cityKey],
				precision: "city",
			};
		}
	}

	// Level 3: Fall back to state center
	if (STATE_COORDINATES[state]) {
		return {
			zipCode,
			city,
			state,
			coordinates: STATE_COORDINATES[state],
			precision: "state",
		};
	}

	return null;
}

/**
 * Parse place of performance string like "Warren, MI" into city and state
 */
export function parsePlaceOfPerformance(placeOfPerformance: string): {
	city?: string;
	state?: string;
} {
	if (!placeOfPerformance || placeOfPerformance === "Nationwide") {
		return {};
	}

	const parts = placeOfPerformance.split(",").map((p) => p.trim());
	if (parts.length >= 2) {
		return {
			city: parts[0],
			state: parts[1],
		};
	}

	return {};
}

/**
 * Convert percentage-based map coordinates to lat/lng
 * For use with react-usa-map overlay positioning
 */
export function mapPercentageToCoordinates(
	leftPercent: number,
	topPercent: number,
	mapBounds = {
		north: 49.3457868, // Northern border
		south: 24.7433195, // Southern border
		east: -66.9513812, // Eastern border
		west: -124.7844079, // Western border
	},
): Coordinates {
	const lat =
		mapBounds.south +
		(mapBounds.north - mapBounds.south) * (1 - topPercent / 100);
	const lng =
		mapBounds.west + (mapBounds.east - mapBounds.west) * (leftPercent / 100);

	return { lat, lng };
}

/**
 * Convert lat/lng coordinates to percentage-based map positioning
 * For positioning dots on the react-usa-map
 */
export function coordinatesToMapPercentage(
	coordinates: Coordinates,
	mapBounds = {
		north: 49.3457868,
		south: 24.7433195,
		east: -66.9513812,
		west: -124.7844079,
	},
): { left: string; top: string } {
	const leftPercent =
		((coordinates.lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) *
		100;
	const topPercent =
		(1 -
			(coordinates.lat - mapBounds.south) /
				(mapBounds.north - mapBounds.south)) *
		100;

	return {
		left: `${Math.max(0, Math.min(100, leftPercent))}%`,
		top: `${Math.max(0, Math.min(100, topPercent))}%`,
	};
}

/**
 * Get multiple contractor locations for mapping
 */
export function getContractorLocations(contractors: any[]): LocationData[] {
	return contractors
		.map((contractor) =>
			getLocationCoordinates(
				contractor.zipCode,
				contractor.city,
				contractor.state,
			),
		)
		.filter((location): location is LocationData => location !== null);
}
