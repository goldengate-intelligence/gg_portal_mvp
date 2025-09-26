import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "../../logic/utils";

export interface CheckboxProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	description?: string;
	onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ className, label, description, onCheckedChange, ...props }, ref) => {
		const [checked, setChecked] = React.useState(
			props.checked || props.defaultChecked || false,
		);

		React.useEffect(() => {
			if (props.checked !== undefined) {
				setChecked(props.checked);
			}
		}, [props.checked]);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newChecked = e.target.checked;
			setChecked(newChecked);
			onCheckedChange?.(newChecked);
			props.onChange?.(e);
		};

		const checkbox = (
			<div className="relative">
				<input
					type="checkbox"
					ref={ref}
					className="sr-only"
					checked={checked}
					onChange={handleChange}
					{...props}
				/>
				<div
					className={cn(
						"h-4 w-4 rounded border border-yellow-500/20 bg-dark-gold",
						"ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50 focus-visible:ring-offset-1",
						"disabled:cursor-not-allowed disabled:opacity-50",
						"cursor-pointer transition-colors",
						checked && "bg-yellow-500 border-yellow-500",
						className,
					)}
				>
					{checked && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
				</div>
			</div>
		);

		if (label || description) {
			return (
				<label className="flex items-start space-x-3 cursor-pointer">
					{checkbox}
					<div className="flex flex-col">
						{label && (
							<span className="text-sm font-medium text-white font-aptos leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
								{label}
							</span>
						)}
						{description && (
							<span className="text-xs text-gray-400 font-aptos mt-1">
								{description}
							</span>
						)}
					</div>
				</label>
			);
		}

		return checkbox;
	},
);
Checkbox.displayName = "Checkbox";

// Radio Group Component
interface RadioGroupProps {
	value?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	className?: string;
	children: React.ReactNode;
}

const RadioGroupContext = React.createContext<{
	value?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
}>({});

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
	({ value, onValueChange, disabled, className, children, ...props }, ref) => {
		return (
			<RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
				<div
					ref={ref}
					role="radiogroup"
					className={cn("grid gap-2", className)}
					{...props}
				>
					{children}
				</div>
			</RadioGroupContext.Provider>
		);
	},
);
RadioGroup.displayName = "RadioGroup";

// Radio Button Component
interface RadioProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
	value: string;
	label?: string;
	description?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
	({ className, value, label, description, ...props }, ref) => {
		const context = React.useContext(RadioGroupContext);
		const isChecked = context.value === value;
		const isDisabled = props.disabled || context.disabled;

		const handleClick = () => {
			if (!isDisabled && context.onValueChange) {
				context.onValueChange(value);
			}
		};

		const radio = (
			<div className="relative">
				<input
					type="radio"
					ref={ref}
					className="sr-only"
					value={value}
					checked={isChecked}
					disabled={isDisabled}
					onChange={() => {}} // Controlled by context
					{...props}
				/>
				<div
					onClick={handleClick}
					className={cn(
						"h-4 w-4 rounded-full border border-yellow-500/20 bg-dark-gold",
						"ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50 focus-visible:ring-offset-1",
						"disabled:cursor-not-allowed disabled:opacity-50",
						"cursor-pointer transition-colors",
						isChecked && "border-yellow-500",
						className,
					)}
				>
					{isChecked && (
						<div className="h-2 w-2 rounded-full bg-yellow-500 absolute top-1 left-1" />
					)}
				</div>
			</div>
		);

		if (label || description) {
			return (
				<label
					className="flex items-start space-x-3 cursor-pointer"
					onClick={handleClick}
				>
					{radio}
					<div className="flex flex-col">
						{label && (
							<span className="text-sm font-medium text-white font-aptos leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
								{label}
							</span>
						)}
						{description && (
							<span className="text-xs text-gray-400 font-aptos mt-1">
								{description}
							</span>
						)}
					</div>
				</label>
			);
		}

		return radio;
	},
);
Radio.displayName = "Radio";

// Checkbox Group Component (for multiple selections)
interface CheckboxGroupProps {
	values: string[];
	onValuesChange: (values: string[]) => void;
	options: {
		value: string;
		label: string;
		description?: string;
		disabled?: boolean;
	}[];
	className?: string;
	orientation?: "vertical" | "horizontal";
}

export function CheckboxGroup({
	values,
	onValuesChange,
	options,
	className,
	orientation = "vertical",
}: CheckboxGroupProps) {
	const handleCheckChange = (value: string, checked: boolean) => {
		if (checked) {
			onValuesChange([...values, value]);
		} else {
			onValuesChange(values.filter((v) => v !== value));
		}
	};

	return (
		<div
			className={cn(
				orientation === "horizontal" ? "flex flex-wrap gap-4" : "space-y-3",
				className,
			)}
		>
			{options.map((option) => (
				<Checkbox
					key={option.value}
					checked={values.includes(option.value)}
					onCheckedChange={(checked) =>
						handleCheckChange(option.value, checked)
					}
					label={option.label}
					description={option.description}
					disabled={option.disabled}
				/>
			))}
		</div>
	);
}

// Toggle/Switch Component
interface ToggleProps {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
	label?: string;
	size?: "sm" | "md" | "lg";
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
	(
		{
			checked = false,
			onCheckedChange,
			disabled,
			className,
			label,
			size = "md",
			...props
		},
		ref,
	) => {
		const sizes = {
			sm: { switch: "h-4 w-8", thumb: "h-3 w-3", translate: "translate-x-4" },
			md: { switch: "h-6 w-11", thumb: "h-5 w-5", translate: "translate-x-5" },
			lg: { switch: "h-7 w-14", thumb: "h-6 w-6", translate: "translate-x-7" },
		};

		const handleClick = () => {
			if (!disabled && onCheckedChange) {
				onCheckedChange(!checked);
			}
		};

		const toggle = (
			<button
				ref={ref}
				type="button"
				role="switch"
				aria-checked={checked}
				disabled={disabled}
				onClick={handleClick}
				className={cn(
					"inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
					"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50 focus-visible:ring-offset-1",
					"disabled:cursor-not-allowed disabled:opacity-50",
					checked ? "bg-yellow-500" : "bg-gold-700",
					sizes[size].switch,
					className,
				)}
				{...props}
			>
				<span
					className={cn(
						"pointer-events-none block rounded-full bg-gray-300 shadow-lg ring-0 transition-transform",
						checked ? sizes[size].translate : "translate-x-0",
						sizes[size].thumb,
					)}
				/>
			</button>
		);

		if (label) {
			return (
				<div className="flex items-center space-x-3">
					{toggle}
					<label
						onClick={handleClick}
						className="text-sm font-medium text-white font-aptos cursor-pointer"
					>
						{label}
					</label>
				</div>
			);
		}

		return toggle;
	},
);
Toggle.displayName = "Toggle";

export { Checkbox, RadioGroup, Radio };
export { Radio as RadioGroupItem };
