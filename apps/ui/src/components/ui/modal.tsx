import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../logic/utils";
import { Button } from "./button";

interface ModalContextType {
	open: boolean;
	setOpen: (open: boolean) => void;
}

const ModalContext = React.createContext<ModalContextType>({
	open: false,
	setOpen: () => {},
});

interface ModalProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
}

const Modal = ({ open = false, onOpenChange, children }: ModalProps) => {
	const [internalOpen, setInternalOpen] = React.useState(open);

	React.useEffect(() => {
		setInternalOpen(open);
	}, [open]);

	const setOpen = React.useCallback(
		(newOpen: boolean) => {
			setInternalOpen(newOpen);
			onOpenChange?.(newOpen);
		},
		[onOpenChange],
	);

	React.useEffect(() => {
		if (internalOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [internalOpen]);

	return (
		<ModalContext.Provider value={{ open: internalOpen, setOpen }}>
			{children}
		</ModalContext.Provider>
	);
};

interface ModalTriggerProps {
	children: React.ReactNode;
	asChild?: boolean;
	className?: string;
}

const ModalTrigger = React.forwardRef<HTMLButtonElement, ModalTriggerProps>(
	({ children, asChild, className, ...props }, ref) => {
		const { setOpen } = React.useContext(ModalContext);

		if (asChild && React.isValidElement(children)) {
			return React.cloneElement(children as any, {
				...props,
				onClick: () => setOpen(true),
			});
		}

		return (
			<button
				ref={ref}
				className={className}
				onClick={() => setOpen(true)}
				{...props}
			>
				{children}
			</button>
		);
	},
);
ModalTrigger.displayName = "ModalTrigger";

interface ModalContentProps {
	children: React.ReactNode;
	className?: string;
	size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
	closeButton?: boolean;
}

const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
	({ children, className, size = "md", closeButton = true, ...props }, ref) => {
		const { open, setOpen } = React.useContext(ModalContext);

		const sizes = {
			sm: "max-w-sm",
			md: "max-w-md",
			lg: "max-w-lg",
			xl: "max-w-xl",
			"2xl": "max-w-5xl",
			full: "max-w-full mx-4",
		};

		if (!open) return null;

		return createPortal(
			<>
				{/* Backdrop */}
				<div
					className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm"
					style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
					onClick={() => setOpen(false)}
				/>

				{/* Modal */}
				<div className="fixed left-[50%] top-[50%] z-[10000] transform -translate-x-1/2 -translate-y-1/2">
					<div
						ref={ref}
						className={cn(
							"w-full bg-black border border-yellow-500/20 rounded-lg shadow-2xl",
							sizes[size],
							className,
						)}
						style={{
							minWidth: "600px",
							maxHeight: "90vh",
							overflow: "auto",
							backgroundColor: "rgb(0, 0, 0)",
							opacity: 1,
						}}
						onClick={(e) => e.stopPropagation()}
						{...props}
					>
						{closeButton && (
							<button
								onClick={() => setOpen(false)}
								className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
							>
								<X className="h-4 w-4 text-gray-400 hover:text-white" />
								<span className="sr-only">Close</span>
							</button>
						)}
						{children}
					</div>
				</div>
			</>,
			document.body,
		);
	},
);
ModalContent.displayName = "ModalContent";

const ModalHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0",
			className,
		)}
		{...props}
	/>
));
ModalHeader.displayName = "ModalHeader";

const ModalFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0",
			className,
		)}
		{...props}
	/>
));
ModalFooter.displayName = "ModalFooter";

const ModalTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h2
		ref={ref}
		className={cn(
			"text-lg leading-none tracking-tight text-yellow-500 font-aptos",
			className,
		)}
		style={{ fontWeight: "250" }}
		{...props}
	/>
));
ModalTitle.displayName = "ModalTitle";

const ModalDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-gray-400 font-aptos", className)}
		{...props}
	/>
));
ModalDescription.displayName = "ModalDescription";

const ModalBody = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("p-6", className)} {...props} />
));
ModalBody.displayName = "ModalBody";

// Confirmation Modal Component
interface ConfirmationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel?: () => void;
	variant?: "default" | "destructive";
}

export function ConfirmationModal({
	open,
	onOpenChange,
	title,
	description,
	confirmText = "Confirm",
	cancelText = "Cancel",
	onConfirm,
	onCancel,
	variant = "default",
}: ConfirmationModalProps) {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	const handleCancel = () => {
		onCancel?.();
		onOpenChange(false);
	};

	return (
		<Modal open={open} onOpenChange={onOpenChange}>
			<ModalContent size="sm">
				<ModalHeader>
					<ModalTitle>{title}</ModalTitle>
					{description && <ModalDescription>{description}</ModalDescription>}
				</ModalHeader>
				<ModalFooter className="mt-6">
					<Button variant="outline" onClick={handleCancel} className="mr-2">
						{cancelText}
					</Button>
					<Button
						variant={variant === "destructive" ? "destructive" : "default"}
						onClick={handleConfirm}
					>
						{confirmText}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

// Alert Modal Component
interface AlertModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	type?: "info" | "warning" | "error" | "success";
}

export function AlertModal({
	open,
	onOpenChange,
	title,
	description,
	type = "info",
}: AlertModalProps) {
	const icons = {
		info: "💡",
		warning: "⚠️",
		error: "❌",
		success: "✅",
	};

	const colors = {
		info: "text-gray-400",
		warning: "text-yellow-400",
		error: "text-red-400",
		success: "text-green-400",
	};

	return (
		<Modal open={open} onOpenChange={onOpenChange}>
			<ModalContent size="sm">
				<ModalHeader>
					<div className="flex items-center gap-3">
						<span className="text-2xl">{icons[type]}</span>
						<ModalTitle className={colors[type]}>{title}</ModalTitle>
					</div>
					{description && (
						<ModalDescription className="mt-2">{description}</ModalDescription>
					)}
				</ModalHeader>
				<ModalFooter className="mt-6">
					<Button onClick={() => onOpenChange(false)}>OK</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

// Sheet/Drawer Component (Side Modal)
interface SheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
	side?: "left" | "right";
}

export function Sheet({
	open,
	onOpenChange,
	children,
	side = "right",
}: SheetProps) {
	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [open]);

	if (!open) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
				onClick={() => onOpenChange(false)}
			/>

			{/* Sheet */}
			<div
				className={cn(
					"fixed z-50 gap-4 bg-medium-gray border-yellow-500/20 shadow-lg transition ease-in-out",
					side === "right"
						? "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm animate-in slide-in-from-right"
						: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm animate-in slide-in-from-left",
				)}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={() => onOpenChange(false)}
					className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
				>
					<X className="h-4 w-4 text-gray-400 hover:text-white" />
					<span className="sr-only">Close</span>
				</button>
				{children}
			</div>
		</>
	);
}

export {
	Modal,
	ModalTrigger,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalTitle,
	ModalDescription,
	ModalBody,
};
