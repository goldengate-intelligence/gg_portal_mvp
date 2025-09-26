import { Database } from "lucide-react";
import React from "react";
import { NetworkDistributionPanel } from "./NetworkDistributionPanel";
import { NetworkSummaryPanel } from "./NetworkSummaryPanel";

interface NetworkTabProps {
	contractor: any;
	networkData: any;
	getMapPosition: (
		zipCode?: string,
		city?: string,
		state?: string,
	) => { left: string; top: string };
	parsePlaceOfPerformance: (location: string) => any;
}

export function NetworkTab({
	contractor,
	networkData,
	getMapPosition,
	parsePlaceOfPerformance,
}: NetworkTabProps) {
	return (
		<div className="space-y-6 min-h-[70vh]">
			{networkData ? (
				<>
					{/* First Row - Network Summary Panel */}
					<NetworkSummaryPanel
						contractor={contractor}
						networkData={networkData}
					/>

					{/* Second Row - Combined Distribution Panel */}
					<NetworkDistributionPanel
						contractor={contractor}
						networkData={networkData}
					/>
				</>
			) : (
				<div className="flex items-center justify-center h-[60vh]">
					<div className="text-center">
						<Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-500 font-light">Loading network data...</p>
					</div>
				</div>
			)}
		</div>
	);
}
