import React from "react";

interface ObligationCardProps {
	event: {
		event_type: "PRIME" | "SUBAWARD";
		event_date: string;
		recipient_name: string;
		event_amount: number;
		award_piid: string;
		action_type: string;
	};
	onEventClick?: (event: any) => void;
}

export function ObligationCard({ event, onEventClick }: ObligationCardProps) {
	const eventTypeColor = event.event_type === "PRIME" ? "#5BC0EB" : "#FF4C4C";

	return (
		<div
			className="border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/40 transition-all group relative bg-gray-900/60 cursor-pointer p-4"
			onClick={() => onEventClick?.(event)}
		>
			{/* Color accent bar */}
			<div
				className="absolute left-0 top-0 bottom-0 w-[2px]"
				style={{ backgroundColor: eventTypeColor }}
			/>

			{/* Basic Card Content */}
			<div className="pl-3">
				<div className="flex justify-between items-start">
					<div>
						<div className="text-white font-medium">
							{event.award_piid} - {event.action_type}
						</div>
						<div className="text-gray-400 text-sm">{event.recipient_name}</div>
						<div className="text-gray-500 text-xs">{event.event_date}</div>
					</div>
					<div className="text-right">
						<div className="text-white font-bold">
							${(event.event_amount / 1000000).toFixed(1)}M
						</div>
						<div className="text-xs text-gray-500 uppercase">
							{event.event_type === "PRIME" ? "Obligation" : "Subaward"}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}