import type { Contractor, ContractorData } from "../types/discovery";

export const adaptContractorData = (data: ContractorData): Contractor => ({
	id: data.uei,
	company_name: data.company_name,
	uei: data.uei,
	naics_description: data.naics_description,
	location: data.location,
	active_awards_value: data.active_awards_value,
	performance_score: data.performance_score,
	certification_level: data.certification_level,
	employees: data.employees,
	founded: data.founded,
});

export const formatCurrency = (value: string | number): string => {
	const num =
		typeof value === "string"
			? Number.parseFloat(value.replace(/[,$]/g, ""))
			: value;
	if (Number.isNaN(num)) return value.toString();

	if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
	if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
	if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
	return `$${num.toLocaleString()}`;
};

export const formatPerformanceScore = (score: number): string => {
	if (score >= 90) return "Exceptional";
	if (score >= 80) return "Very Good";
	if (score >= 70) return "Good";
	if (score >= 60) return "Fair";
	return "Poor";
};

export const getStatusColor = (status: string): string => {
	switch (status) {
		case "completed":
		case "success":
			return "green";
		case "running":
			return "blue";
		case "failed":
		case "error":
			return "red";
		default:
			return "gray";
	}
};

export const generateMockContractors = (count = 25): Contractor[] => {
	const companies = [
		"Lockheed Martin Corporation",
		"Boeing Company",
		"Raytheon Technologies",
		"General Dynamics",
		"Northrop Grumman",
		"L3Harris Technologies",
		"BAE Systems",
		"CACI International",
		"SAIC",
		"Booz Allen Hamilton",
		"Accenture Federal Services",
		"IBM Federal",
		"Microsoft Federal",
		"Amazon Web Services",
		"Oracle America",
		"Dell Technologies Federal",
	];

	const naicsCodes = [
		"Aerospace Product and Parts Manufacturing",
		"Computer Systems Design Services",
		"Management Consulting Services",
		"Research and Development in Engineering",
		"Software Publishers",
		"Data Processing Services",
	];

	const locations = [
		"Arlington, VA",
		"Bethesda, MD",
		"McLean, VA",
		"Reston, VA",
		"Alexandria, VA",
		"Rockville, MD",
		"Fairfax, VA",
		"Tysons, VA",
	];

	const certifications = ["8(a)", "SDVOSB", "WOSB", "HUBZone", "SBA", "GSA"];

	return Array.from({ length: count }, (_, i) => ({
		id: `UEI${(i + 1).toString().padStart(9, "0")}`,
		company_name: companies[Math.floor(Math.random() * companies.length)],
		uei: `UEI${(i + 1).toString().padStart(9, "0")}`,
		naics_description:
			naicsCodes[Math.floor(Math.random() * naicsCodes.length)],
		location: locations[Math.floor(Math.random() * locations.length)],
		active_awards_value: `$${(Math.random() * 1000000000).toFixed(0)}`,
		performance_score: Math.floor(Math.random() * 40) + 60,
		certification_level:
			certifications[Math.floor(Math.random() * certifications.length)],
		employees: Math.floor(Math.random() * 10000) + 100,
		founded: Math.floor(Math.random() * 50) + 1970,
	}));
};
