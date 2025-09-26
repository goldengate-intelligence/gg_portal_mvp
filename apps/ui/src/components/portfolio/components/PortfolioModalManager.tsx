import React from "react";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { GroupDeleteModal } from "./GroupDeleteModal";

interface PortfolioModalManagerProps {
	// Individual asset deletion
	showDeleteConfirm: string | null;
	onDeleteConfirm: (uei: string) => void;
	onDeleteCancel: () => void;

	// Group deletion
	showGroupDelete: string | null;
	onGroupRemoveOnly: (uei: string) => void;
	onGroupDeleteFromPortfolio: (uei: string) => void;
	onGroupDeleteCancel: () => void;

	// Portfolio delete confirmation (after group delete)
	showPortfolioConfirm: string | null;
	onPortfolioConfirm: (uei: string) => void;
	onPortfolioCancel: () => void;

	// Helper to get company name by UEI
	getCompanyName: (uei: string) => string;
}

export function PortfolioModalManager({
	showDeleteConfirm,
	onDeleteConfirm,
	onDeleteCancel,
	showGroupDelete,
	onGroupRemoveOnly,
	onGroupDeleteFromPortfolio,
	onGroupDeleteCancel,
	showPortfolioConfirm,
	onPortfolioConfirm,
	onPortfolioCancel,
	getCompanyName,
}: PortfolioModalManagerProps) {
	return (
		<>
			{/* Individual Asset Delete Modal */}
			<DeleteConfirmationModal
				isOpen={!!showDeleteConfirm}
				companyName={showDeleteConfirm ? getCompanyName(showDeleteConfirm) : ""}
				onConfirm={() => {
					if (showDeleteConfirm) {
						onDeleteConfirm(showDeleteConfirm);
					}
				}}
				onCancel={onDeleteCancel}
			/>

			{/* Group Delete Options Modal */}
			<GroupDeleteModal
				isOpen={!!showGroupDelete}
				companyName={showGroupDelete ? getCompanyName(showGroupDelete) : ""}
				onRemoveFromGroup={() => {
					if (showGroupDelete) {
						onGroupRemoveOnly(showGroupDelete);
					}
				}}
				onDeleteFromPortfolio={() => {
					if (showGroupDelete) {
						onGroupDeleteFromPortfolio(showGroupDelete);
					}
				}}
				onCancel={onGroupDeleteCancel}
			/>

			{/* Portfolio Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={!!showPortfolioConfirm}
				companyName={
					showPortfolioConfirm ? getCompanyName(showPortfolioConfirm) : ""
				}
				onConfirm={() => {
					if (showPortfolioConfirm) {
						onPortfolioConfirm(showPortfolioConfirm);
					}
				}}
				onCancel={onPortfolioCancel}
			/>
		</>
	);
}
