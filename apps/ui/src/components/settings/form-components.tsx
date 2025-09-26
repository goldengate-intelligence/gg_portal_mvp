import type { ReactNode } from "react";
import { CONTRACTOR_DETAIL_COLORS } from "../../logic/utils";
import { Button } from "../ui/button";

interface FormSectionProps {
	title: string;
	description?: string;
	children: ReactNode;
}

export function FormSection({
	title,
	description,
	children,
}: FormSectionProps) {
	return (
		<div
			className="p-6 border border-gray-700 rounded-xl relative overflow-hidden mb-6"
			style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
		>
			<div className="mb-6">
				<h3
					className="text-white font-medium text-lg mb-2"
					style={{ fontFamily: "Michroma, sans-serif" }}
				>
					{title}
				</h3>
				{description && (
					<p
						className="text-gray-400 text-sm"
						style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
					>
						{description}
					</p>
				)}
			</div>
			{children}
		</div>
	);
}

interface FormFieldProps {
	label: string;
	id: string;
	type?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	error?: boolean;
	helpText?: string;
}

export function FormField({
	label,
	id,
	type = "text",
	value,
	onChange,
	placeholder,
	required = false,
	disabled = false,
	error = false,
	helpText,
}: FormFieldProps) {
	const getFieldClassName = () => {
		const baseClasses =
			"appearance-none relative block w-full px-4 py-3 text-white rounded-lg focus:outline-none sm:text-sm backdrop-blur-sm transition-all duration-200";

		if (error) {
			return `${baseClasses} border border-red-500/50 focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 hover:border-red-400/50`;
		}

		return `${baseClasses} border border-gray-600/20 focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 hover:border-gray-500/30`;
	};

	return (
		<div className="mb-4">
			<label
				htmlFor={id}
				className="block text-sm font-medium text-gray-300 mb-2"
				style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
			>
				{label}
				{required && <span className="text-red-400 ml-1">*</span>}
			</label>
			<input
				id={id}
				name={id}
				type={type}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required={required}
				disabled={disabled}
				className={getFieldClassName()}
				style={{
					backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
					fontFamily: "system-ui, -apple-system, sans-serif",
				}}
			/>
			{helpText && (
				<p
					className="mt-2 text-xs text-gray-500"
					style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
				>
					{helpText}
				</p>
			)}
		</div>
	);
}

interface FormTextareaProps {
	label: string;
	id: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	error?: boolean;
	helpText?: string;
	rows?: number;
}

export function FormTextarea({
	label,
	id,
	value,
	onChange,
	placeholder,
	required = false,
	disabled = false,
	error = false,
	helpText,
	rows = 4,
}: FormTextareaProps) {
	const getFieldClassName = () => {
		const baseClasses =
			"appearance-none relative block w-full px-4 py-3 text-white rounded-lg focus:outline-none sm:text-sm backdrop-blur-sm transition-all duration-200 resize-vertical";

		if (error) {
			return `${baseClasses} border border-red-500/50 focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 hover:border-red-400/50`;
		}

		return `${baseClasses} border border-gray-600/20 focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 hover:border-gray-500/30`;
	};

	return (
		<div className="mb-4">
			<label
				htmlFor={id}
				className="block text-sm font-medium text-gray-300 mb-2"
				style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
			>
				{label}
				{required && <span className="text-red-400 ml-1">*</span>}
			</label>
			<textarea
				id={id}
				name={id}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required={required}
				disabled={disabled}
				rows={rows}
				className={getFieldClassName()}
				style={{
					backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
					fontFamily: "system-ui, -apple-system, sans-serif",
				}}
			/>
			{helpText && (
				<p
					className="mt-2 text-xs text-gray-500"
					style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
				>
					{helpText}
				</p>
			)}
		</div>
	);
}

interface FormSelectProps {
	label: string;
	id: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	options: { value: string; label: string }[];
	required?: boolean;
	disabled?: boolean;
	error?: boolean;
	helpText?: string;
}

export function FormSelect({
	label,
	id,
	value,
	onChange,
	options,
	required = false,
	disabled = false,
	error = false,
	helpText,
}: FormSelectProps) {
	const getFieldClassName = () => {
		const baseClasses =
			"appearance-none relative block w-full px-4 py-3 text-white rounded-lg focus:outline-none sm:text-sm backdrop-blur-sm transition-all duration-200";

		if (error) {
			return `${baseClasses} border border-red-500/50 focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 hover:border-red-400/50`;
		}

		return `${baseClasses} border border-gray-600/20 focus:ring-1 focus:ring-[#D2AC38]/50 focus:border-[#D2AC38]/50 hover:border-gray-500/30`;
	};

	return (
		<div className="mb-4">
			<label
				htmlFor={id}
				className="block text-sm font-medium text-gray-300 mb-2"
				style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
			>
				{label}
				{required && <span className="text-red-400 ml-1">*</span>}
			</label>
			<select
				id={id}
				name={id}
				value={value}
				onChange={onChange}
				required={required}
				disabled={disabled}
				className={getFieldClassName()}
				style={{
					backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor,
					fontFamily: "system-ui, -apple-system, sans-serif",
				}}
			>
				{options.map((option) => (
					<option
						key={option.value}
						value={option.value}
						style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
					>
						{option.label}
					</option>
				))}
			</select>
			{helpText && (
				<p
					className="mt-2 text-xs text-gray-500"
					style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
				>
					{helpText}
				</p>
			)}
		</div>
	);
}

interface FormCheckboxProps {
	label: string;
	id: string;
	checked: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	helpText?: string;
}

export function FormCheckbox({
	label,
	id,
	checked,
	onChange,
	disabled = false,
	helpText,
}: FormCheckboxProps) {
	return (
		<div className="mb-4">
			<div className="flex items-start gap-3">
				<input
					id={id}
					name={id}
					type="checkbox"
					checked={checked}
					onChange={onChange}
					disabled={disabled}
					className="mt-1 h-4 w-4 rounded border-gray-600/20 bg-gray-900 text-[#D2AC38] focus:ring-[#D2AC38]/50 focus:ring-offset-0"
				/>
				<div>
					<label
						htmlFor={id}
						className="text-sm font-medium text-gray-300"
						style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
					>
						{label}
					</label>
					{helpText && (
						<p
							className="mt-1 text-xs text-gray-500"
							style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
						>
							{helpText}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

interface FormActionsProps {
	children: ReactNode;
}

export function FormActions({ children }: FormActionsProps) {
	return (
		<div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-700">
			{children}
		</div>
	);
}

interface SaveButtonProps {
	loading?: boolean;
	disabled?: boolean;
	onClick?: () => void;
	type?: "button" | "submit";
	children?: ReactNode;
}

export function SaveButton({
	loading = false,
	disabled = false,
	onClick,
	type = "submit",
	children = "Save Changes",
}: SaveButtonProps) {
	return (
		<Button
			type={type}
			onClick={onClick}
			disabled={loading || disabled}
			className="bg-[#D2AC38] hover:bg-[#D2AC38]/90 text-black font-medium px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#D2AC38]/20 disabled:opacity-50 disabled:cursor-not-allowed"
			style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
		>
			{loading ? "Saving..." : children}
		</Button>
	);
}

interface CancelButtonProps {
	onClick?: () => void;
	children?: ReactNode;
}

export function CancelButton({
	onClick,
	children = "Cancel",
}: CancelButtonProps) {
	return (
		<Button
			type="button"
			onClick={onClick}
			variant="outline"
			className="border-gray-600/50 text-gray-300 hover:bg-gray-700/30 hover:text-gray-200 px-6 py-2"
			style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
		>
			{children}
		</Button>
	);
}
