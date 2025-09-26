import React from 'react';

/**
 * Logo.dev Attribution Component
 * Required when using Logo.dev API on free tier
 */
export function LogoAttribution() {
	return (
		<div className="text-xs text-gray-500 text-center py-2">
			<a
				href="https://logo.dev"
				title="Logo API"
				target="_blank"
				rel="noopener noreferrer"
				className="hover:text-gray-400 transition-colors"
			>
				Logos provided by Logo.dev
			</a>
		</div>
	);
}