import React, { useEffect, useState } from 'react';
import { lushaEnrichmentService } from '../services/contractors/lusha-enrichment-service';
import type { LushaEnrichmentResponse } from '../services/contractors/lusha-enrichment-service';

/**
 * Test component for Lusha API integration
 * This can be removed after testing is complete
 */
export function LushaTest() {
	const [enrichmentResults, setEnrichmentResults] = useState<Record<string, LushaEnrichmentResponse>>({});
	const [loading, setLoading] = useState(false);

	// Test companies
	const testCompanies = [
		'Raytheon Technologies',
		'Lockheed Martin Corporation',
		'Boeing',
		'Microsoft Corporation',
		'Trio Fabrication LLC'
	];

	const testEnrichment = async () => {
		setLoading(true);
		const results: Record<string, LushaEnrichmentResponse> = {};

		for (const company of testCompanies) {
			try {
				const result = await lushaEnrichmentService.enrichCompanyByName(company);
				results[company] = result;
			} catch (error) {
				results[company] = {
					companyData: null,
					source: 'fallback',
					quality: 'low',
					error: error.message
				};
			}
		}

		setEnrichmentResults(results);
		setLoading(false);
	};

	useEffect(() => {
		testEnrichment();
	}, []);

	const serviceStatus = lushaEnrichmentService.getStatus();

	return (
		<div className="p-6 bg-gray-900 text-white">
			<h2 className="text-xl font-bold mb-4">Lusha API Integration Test</h2>

			{/* Service Status */}
			<div className="mb-6 p-4 bg-gray-800 rounded-lg">
				<h3 className="font-semibold mb-2">Service Status</h3>
				<div className="text-sm space-y-1">
					{serviceStatus.apiKeyConfigured ? (
						<div className="text-green-400">✅ Lusha API key configured</div>
					) : (
						<div className="text-yellow-400">⚠️ Lusha API key not configured (using fallback)</div>
					)}
					<div>✅ Caching enabled</div>
					<div>✅ Fallback data available</div>
				</div>
			</div>

			{loading ? (
				<div className="text-yellow-400">Testing Lusha API...</div>
			) : (
				<div className="space-y-4">
					{testCompanies.map((company) => {
						const result = enrichmentResults[company];
						return (
							<div key={company} className="border border-gray-700 rounded-lg p-4">
								<div className="flex items-start justify-between mb-2">
									<div className="flex-1">
										<div className="font-semibold">{company}</div>
										<div className={`text-sm font-semibold ${
											result?.source === 'api' ? 'text-green-400' :
											result?.source === 'cache' ? 'text-blue-400' :
											result?.source === 'fallback' ? 'text-yellow-400' :
											'text-red-400'
										}`}>
											Source: {result?.source?.toUpperCase() || 'ERROR'}
										</div>
									</div>
									<div className="text-right text-sm text-gray-400">
										Quality: {result?.quality || 'unknown'}
									</div>
								</div>

								{/* Company Data */}
								{result?.companyData ? (
									<div className="bg-gray-800 rounded p-3 mt-2">
										<div className="grid grid-cols-2 gap-4 text-sm">
											{result.companyData.website && (
												<div>
													<span className="text-gray-400">Website:</span>{' '}
													<a
														href={`https://${result.companyData.website}`}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-400 hover:underline"
													>
														{result.companyData.website}
													</a>
												</div>
											)}
											{result.companyData.industry && (
												<div>
													<span className="text-gray-400">Industry:</span>{' '}
													<span className="text-white">{result.companyData.industry}</span>
												</div>
											)}
											{result.companyData.employeeRange && (
												<div>
													<span className="text-gray-400">Employees:</span>{' '}
													<span className="text-white">{result.companyData.employeeRange}</span>
												</div>
											)}
											{result.companyData.location?.country && (
												<div>
													<span className="text-gray-400">Location:</span>{' '}
													<span className="text-white">
														{result.companyData.location.city}, {result.companyData.location.state} {result.companyData.location.country}
													</span>
												</div>
											)}
											{result.companyData.socialMedia?.linkedin && (
												<div>
													<span className="text-gray-400">LinkedIn:</span>{' '}
													<a
														href={result.companyData.socialMedia.linkedin}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-400 hover:underline"
													>
														View Profile
													</a>
												</div>
											)}
											{result.companyData.phone && (
												<div>
													<span className="text-gray-400">Phone:</span>{' '}
													<span className="text-white">{result.companyData.phone}</span>
												</div>
											)}
										</div>
									</div>
								) : (
									<div className="text-red-400 text-sm mt-2">
										No company data available
										{result?.error && <div className="text-xs mt-1">Error: {result.error}</div>}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}