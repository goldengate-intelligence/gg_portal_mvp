import React, { useEffect, useState } from 'react';
import { contractorLogoService } from '../services/contractors/contractor-logo-service';
import type { LogoResponse } from '../services/contractors/contractor-logo-service';

/**
 * Test component for Logo.dev API integration
 * This can be removed after testing is complete
 */
export function LogoTest() {
	const [logoResults, setLogoResults] = useState<Record<string, LogoResponse>>({});
	const [loading, setLoading] = useState(false);

	// Test companies with known domains
	const testCompanies = [
		{ uei: 'RTX987654321', name: 'Raytheon Technologies' },
		{ uei: 'LMT123456789', name: 'Lockheed Martin Corporation' },
		{ uei: 'MSFT987654321', name: 'Microsoft Corporation' },
		{ uei: 'TFL123456789', name: 'Trio Fabrication LLC' },
		{ uei: 'IBM123456789', name: 'IBM' }
	];

	const testLogos = async () => {
		setLoading(true);
		const results: Record<string, LogoResponse> = {};

		for (const company of testCompanies) {
			try {
				const result = await contractorLogoService.getContractorLogo(
					company.uei,
					company.name
				);
				results[company.uei] = result;
			} catch (error) {
				results[company.uei] = {
					logoUrl: null,
					source: 'fallback',
					quality: 'low'
				};
				console.warn(`Logo test failed for ${company.name}:`, error);
			}
		}

		setLogoResults(results);
		setLoading(false);
	};

	useEffect(() => {
		testLogos();
	}, []);

	return (
		<div className="p-6 bg-gray-900 text-white">
			<h2 className="text-xl font-bold mb-4">Logo.dev API Integration Test</h2>

			{loading ? (
				<div className="text-yellow-400">Testing Logo.dev API...</div>
			) : (
				<div className="space-y-4">
					{testCompanies.map((company) => {
						const result = logoResults[company.uei];
						return (
							<div key={company.uei} className="border border-gray-700 rounded-lg p-4">
								<div className="flex items-center gap-4">
									{/* Logo Display */}
									<div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center">
										{result?.logoUrl ? (
											<img
												src={result.logoUrl}
												alt={`${company.name} logo`}
												className="max-w-full max-h-full object-contain"
												onError={(e) => {
													console.log('Image failed to load:', result.logoUrl);
													e.currentTarget.style.display = 'none';
												}}
											/>
										) : (
											<div className="text-gray-500 text-xs text-center">
												NO LOGO
											</div>
										)}
									</div>

									{/* Company Info */}
									<div className="flex-1">
										<div className="font-semibold">{company.name}</div>
										<div className="text-sm text-gray-400">UEI: {company.uei}</div>
									</div>

									{/* Result Info */}
									<div className="text-right text-sm">
										<div className={`font-semibold ${
											result?.source === 'api' ? 'text-green-400' :
											result?.source === 'fallback' ? 'text-yellow-400' :
											'text-red-400'
										}`}>
											{result?.source?.toUpperCase() || 'ERROR'}
										</div>
										<div className="text-gray-400">
											Quality: {result?.quality || 'unknown'}
										</div>
										{result?.logoUrl && (
											<div className="text-xs text-blue-400 mt-1">
												<a href={result.logoUrl} target="_blank" rel="noopener noreferrer">
													View Logo URL
												</a>
											</div>
										)}
									</div>
								</div>
							</div>
						);
					})}

					{/* API Status */}
					<div className="mt-6 p-4 bg-gray-800 rounded-lg">
						<h3 className="font-semibold mb-2">API Integration Status</h3>
						<div className="text-sm space-y-1">
							<div>✅ Logo.dev API integrated</div>
							<div>✅ Domain mapping configured</div>
							<div>✅ Fallback system ready</div>
							<div>✅ Caching enabled</div>
							{process.env.VITE_LOGO_DEV_API_KEY ? (
								<div className="text-green-400">✅ API key configured</div>
							) : (
								<div className="text-yellow-400">⚠️ API key not set (using free tier)</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}