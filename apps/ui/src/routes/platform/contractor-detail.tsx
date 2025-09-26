import { useParams } from "@tanstack/react-router";
import React, { useState, useCallback } from "react";
import { ContractorDetail } from "../../components/contractor-detail";
import { useAuth } from "../../contexts/auth-context";

export default function ContractorDetailRoute() {
	const { user, logout } = useAuth();
	const params = useParams({
		from: "/platform/contractor-detail/$contractorId",
	});
	const [activeTab, setActiveTab] = useState("overview");

	// Memoize the callback to prevent infinite re-renders
	const handleActiveTabChange = useCallback((tab: string) => {
		setActiveTab(tab);
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-b from-black/90 via-gray-900/50 to-black/90 relative overflow-hidden">
			{/* Main Content */}
			<div className="relative z-10 pb-20 pt-16">
				{" "}
				{/* Add top padding for header and bottom padding for footer */}
				<ContractorDetail
					contractorId={params.contractorId}
					onActiveTabChange={handleActiveTabChange}
				/>
			</div>
		</div>
	);
}
