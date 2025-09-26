import React, { useState, useEffect } from "react";
import {
	type ContactSearchFilters,
	type ContractorContact,
	contractorContactService,
} from "../../services/contact-integration";
import { ContactFilterPanel } from "./ContactFilterPanel";
import { ContactGridPanel } from "./ContactGridPanel";

interface Person {
	id: string;
	fullName: string;
	firstName?: string;
	lastName?: string;
	jobTitle?: string;
	seniority?: string;
	department?: string;
	email?: string;
	emailRevealed?: boolean;
	phone?: string;
	phoneRevealed?: boolean;
	linkedin?: string;
	company?: string;
	location?: string;
	updateDate?: string;
}

interface ContactsTabProps {
	uei: string;
	companyName: string;
	companyDomain?: string;
}

export function ContactsTab({
	uei,
	companyName,
	companyDomain,
}: ContactsTabProps) {
	const [people, setPeople] = useState<Person[]>([]);
	const [contacts, setContacts] = useState<ContractorContact[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedSeniority, setSelectedSeniority] = useState<string[]>([]);
	const [selectedDepartment, setSelectedDepartment] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [availableDepartments, setAvailableDepartments] = useState<string[]>(
		[],
	);
	const [exportingCsv, setExportingCsv] = useState(false);

	// Fetch contacts from Lusha API (with mock fallback)
	useEffect(() => {
		const fetchContacts = async () => {
			setLoading(true);

			try {
				const result = await contractorContactService.getContractorContacts(
					uei,
					companyName,
					companyDomain ? { website: companyDomain } : undefined,
				);

				setContacts(result.contacts);
				setAvailableDepartments(result.departments);

				// Transform to legacy Person format for existing components
				const transformedPeople: Person[] = result.contacts.map((contact) => ({
					id: contact.id,
					fullName: contact.fullName,
					firstName: contact.firstName,
					lastName: contact.lastName,
					jobTitle: contact.title,
					seniority: contact.seniority,
					department: contact.department,
					email: contact.email,
					emailRevealed: !!contact.email,
					phone: contact.phone,
					phoneRevealed: !!contact.phone,
					linkedin: contact.linkedinUrl,
					company: contact.companyName,
					location: contact.location
						? `${contact.location.city || ""}, ${contact.location.state || ""}`.replace(
								/^, |, $/,
								"",
							)
						: undefined,
					updateDate: new Date(contact.lastUpdated).toLocaleDateString(),
				}));

				setPeople(transformedPeople);
			} catch (error) {
				console.error("Failed to fetch contacts:", error);
				setPeople([]);
				setContacts([]);
				setAvailableDepartments([]);
			} finally {
				setLoading(false);
			}
		};

		fetchContacts();
	}, [uei, companyName, companyDomain]);

	const handleRevealEmail = async (personId: string) => {
		// Mock API call to reveal email
		setPeople((prev) =>
			prev.map((p) =>
				p.id === personId
					? { ...p, email: "revealed@triofab.com", emailRevealed: true }
					: p,
			),
		);
	};

	const handleRevealPhone = async (personId: string) => {
		// Mock API call to reveal phone
		setPeople((prev) =>
			prev.map((p) =>
				p.id === personId
					? { ...p, phone: "(512) 555-0123", phoneRevealed: true }
					: p,
			),
		);
	};

	const filteredPeople = people.filter((person) => {
		const matchesSeniority =
			selectedSeniority.length === 0 ||
			selectedSeniority.includes(person.seniority || "");
		const matchesDepartment =
			selectedDepartment.length === 0 ||
			selectedDepartment.includes(person.department || "");
		const matchesSearch =
			searchQuery === "" ||
			person.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			person.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());

		return matchesSeniority && matchesDepartment && matchesSearch;
	});

	// Handle CSV export
	const handleExportCsv = async () => {
		setExportingCsv(true);

		try {
			const filters: ContactSearchFilters = {
				department:
					selectedDepartment.length > 0 ? selectedDepartment[0] : undefined,
				seniority:
					selectedSeniority.length > 0 ? selectedSeniority[0] : undefined,
				searchTerm: searchQuery || undefined,
			};

			const exportData = await contractorContactService.exportContactsToCSV(
				uei,
				companyName,
				filters,
			);

			// Create blob and download
			const blob = new Blob([exportData.csvContent], { type: "text/csv" });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = exportData.fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to export CSV:", error);
		} finally {
			setExportingCsv(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Search and Filters Bar */}
			<ContactFilterPanel
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				selectedSeniority={selectedSeniority}
				setSelectedSeniority={setSelectedSeniority}
				selectedDepartment={selectedDepartment}
				setSelectedDepartment={setSelectedDepartment}
				filteredPeople={filteredPeople}
				onExportCsv={handleExportCsv}
				exportingCsv={exportingCsv}
			/>

			{/* People Grid */}
			<ContactGridPanel
				people={filteredPeople}
				loading={loading}
				onRevealEmail={handleRevealEmail}
				onRevealPhone={handleRevealPhone}
			/>
		</div>
	);
}
