import { useCallback, useEffect, useState } from "react";

interface Shortcut {
	key: string;
	ctrl?: boolean;
	alt?: boolean;
	shift?: boolean;
	meta?: boolean;
	action: () => void;
	description: string;
	category?: string;
}

const defaultShortcuts: Shortcut[] = [
	// Navigation
	{
		key: "i",
		ctrl: true,
		action: () => {},
		description: "Go to Identify Targets",
		category: "Navigation",
	},
	{
		key: "p",
		ctrl: true,
		action: () => {},
		description: "Go to Portfolio",
		category: "Navigation",
	},
	{
		key: "a",
		ctrl: true,
		action: () => {},
		description: "Go to Analysis",
		category: "Navigation",
	},
	{
		key: "h",
		ctrl: true,
		action: () => {},
		description: "Go Home",
		category: "Navigation",
	},

	// Search & Filter
	{
		key: "/",
		ctrl: false,
		action: () => {},
		description: "Focus search",
		category: "Search",
	},
	{
		key: "f",
		ctrl: true,
		action: () => {},
		description: "Open filters",
		category: "Search",
	},
	{
		key: "Escape",
		ctrl: false,
		action: () => {},
		description: "Clear search/Close modal",
		category: "Search",
	},

	// Actions
	{
		key: "s",
		ctrl: true,
		action: () => {},
		description: "Save",
		category: "Actions",
	},
	{
		key: "e",
		ctrl: true,
		action: () => {},
		description: "Export",
		category: "Actions",
	},
	{
		key: "n",
		ctrl: true,
		action: () => {},
		description: "New note",
		category: "Actions",
	},
	{
		key: "Enter",
		ctrl: true,
		action: () => {},
		description: "Submit/Confirm",
		category: "Actions",
	},

	// View
	{
		key: "1",
		alt: true,
		action: () => {},
		description: "Card view",
		category: "View",
	},
	{
		key: "2",
		alt: true,
		action: () => {},
		description: "Table view",
		category: "View",
	},
	{
		key: "r",
		ctrl: true,
		action: () => {},
		description: "Refresh data",
		category: "View",
	},

	// Help
	{
		key: "?",
		shift: true,
		action: () => {},
		description: "Show shortcuts",
		category: "Help",
	},
	{
		key: "h",
		ctrl: true,
		shift: true,
		action: () => {},
		description: "Open help",
		category: "Help",
	},
];

export function useKeyboardShortcuts(customShortcuts?: Partial<Shortcut>[]) {
	const [showShortcuts, setShowShortcuts] = useState(false);
	const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

	const shortcuts = customShortcuts
		? defaultShortcuts.map((ds) => {
				const custom = customShortcuts.find(
					(cs) => cs.key === ds.key && cs.ctrl === ds.ctrl,
				);
				return custom ? { ...ds, ...custom } : ds;
			})
		: defaultShortcuts;

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			// Don't trigger shortcuts when typing in inputs
			const target = event.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.contentEditable === "true"
			) {
				// Allow Escape to work in inputs
				if (event.key !== "Escape") {
					return;
				}
			}

			const matchingShortcut = shortcuts.find((shortcut) => {
				const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
				const ctrlMatch = shortcut.ctrl
					? event.ctrlKey || event.metaKey
					: !event.ctrlKey && !event.metaKey;
				const altMatch = shortcut.alt ? event.altKey : !event.altKey;
				const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

				return keyMatch && ctrlMatch && altMatch && shiftMatch;
			});

			if (matchingShortcut) {
				event.preventDefault();
				matchingShortcut.action();

				// Track recently used shortcuts
				const shortcutKey = `${matchingShortcut.ctrl ? "Ctrl+" : ""}${matchingShortcut.alt ? "Alt+" : ""}${matchingShortcut.shift ? "Shift+" : ""}${matchingShortcut.key}`;
				setRecentlyUsed((prev) =>
					[shortcutKey, ...prev.filter((k) => k !== shortcutKey)].slice(0, 5),
				);
			}

			// Show shortcuts help with ?
			if (event.key === "?" && event.shiftKey) {
				event.preventDefault();
				setShowShortcuts(true);
			}
		},
		[shortcuts],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	const registerShortcut = useCallback(
		(shortcut: Shortcut) => {
			const index = shortcuts.findIndex(
				(s) =>
					s.key === shortcut.key &&
					s.ctrl === shortcut.ctrl &&
					s.alt === shortcut.alt &&
					s.shift === shortcut.shift,
			);

			if (index >= 0) {
				shortcuts[index] = shortcut;
			} else {
				shortcuts.push(shortcut);
			}
		},
		[shortcuts],
	);

	const unregisterShortcut = useCallback(
		(
			key: string,
			modifiers?: { ctrl?: boolean; alt?: boolean; shift?: boolean },
		) => {
			const index = shortcuts.findIndex(
				(s) =>
					s.key === key &&
					s.ctrl === modifiers?.ctrl &&
					s.alt === modifiers?.alt &&
					s.shift === modifiers?.shift,
			);

			if (index >= 0) {
				shortcuts.splice(index, 1);
			}
		},
		[shortcuts],
	);

	const getShortcutString = (shortcut: Shortcut) => {
		const parts = [];
		if (shortcut.ctrl) parts.push("Ctrl");
		if (shortcut.alt) parts.push("Alt");
		if (shortcut.shift) parts.push("Shift");
		parts.push(shortcut.key.toUpperCase());
		return parts.join("+");
	};

	const getShortcutsByCategory = () => {
		const categories: Record<string, Shortcut[]> = {};
		shortcuts.forEach((shortcut) => {
			const category = shortcut.category || "Other";
			if (!categories[category]) {
				categories[category] = [];
			}
			categories[category].push(shortcut);
		});
		return categories;
	};

	return {
		shortcuts,
		showShortcuts,
		setShowShortcuts,
		recentlyUsed,
		registerShortcut,
		unregisterShortcut,
		getShortcutString,
		getShortcutsByCategory,
	};
}

// Context for global shortcuts
import type React from "react";
import { createContext, useContext } from "react";

interface ShortcutsContextValue {
	registerShortcut: (shortcut: Shortcut) => void;
	unregisterShortcut: (
		key: string,
		modifiers?: { ctrl?: boolean; alt?: boolean; shift?: boolean },
	) => void;
	showHelp: () => void;
}

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);

export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
	const { registerShortcut, unregisterShortcut, setShowShortcuts } =
		useKeyboardShortcuts();

	const showHelp = () => setShowShortcuts(true);

	return (
		<ShortcutsContext.Provider
			value={{ registerShortcut, unregisterShortcut, showHelp }}
		>
			{children}
		</ShortcutsContext.Provider>
	);
}

export function useShortcuts() {
	const context = useContext(ShortcutsContext);
	if (!context) {
		throw new Error("useShortcuts must be used within ShortcutsProvider");
	}
	return context;
}
