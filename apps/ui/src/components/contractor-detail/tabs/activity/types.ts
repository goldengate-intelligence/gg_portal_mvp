export interface Contract {
	parentAward: string;
	id: string;
	role: "prime" | "sub";
	client: string;
	clientType: "agency" | "prime" | "sub";
	desc: string;
	totalValue: string;
	currentValue: string;
	mods: number;
	start: string;
	end: string;
	naics: string;
	psc: string;
	type: string;
	utilization: number;
	subTo: string | null;
}

export interface Relationship {
	name: string;
	type: "agency" | "prime" | "sub";
	role: "prime" | "sub";
	contracts: Contract[];
	totalValue: number;
	earliestStart: Date | null;
	latestEnd: Date | null;
	flowType?: "inflow" | "outflow";
	originContainer?: "inflow" | "outflow";
}

export interface SortedInflowRelationships {
	agencies: Relationship[];
	primes: Relationship[];
}

export interface ActivityDetailPanelProps {
	contractor: any;
	performanceData: any;
}

export interface RelationshipCardProps {
	relationship: Relationship;
	type: "inflow" | "outflow";
	isExpanded: boolean;
	activeTooltip: string | null;
	onToggleExpansion: (relationshipName: string) => void;
	onSetActiveTooltip: (tooltip: string | null) => void;
	onOpenAwardCardView: (
		relationship: Relationship,
		originContainer: "inflow" | "outflow",
		event: React.MouseEvent,
	) => void;
}

export interface ContractDetailsProps {
	contract: Contract;
}
