import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import { type User, apiClient } from "../services/api-client";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (userData: {
		email: string;
		username: string;
		password: string;
		fullName?: string;
		companyName?: string;
	}) => Promise<void>;
	logout: () => Promise<void>;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const isAuthenticated = user !== null;

	useEffect(() => {
		// DEV MODE: Auto-login bypass for development
		const mockUser = {
			id: "dev-user-123",
			email: "andrew@goldengate.dev",
			username: "ajb327",
			fullName: "Andrew Julius Berman",
			role: "admin" as const,
			tenantId: "4186f616-a3f8-4078-9027-9726634f9e92",
			organizationId: "9411fe24-da93-4cc2-a9f9-294630dca6bc",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		setUser(mockUser);
		setLoading(false);

		// Original auth logic (commented out for development)
		/*
    const token = localStorage.getItem('access_token');
    if (token) {
      apiClient
        .getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    */
	}, []);

	const login = async (email: string, password: string) => {
		const response = await apiClient.login({ email, password });
		setUser(response.user);
	};

	const register = async (userData: {
		email: string;
		username: string;
		password: string;
		fullName?: string;
		companyName?: string;
	}) => {
		await apiClient.register(userData);
		await login(userData.email, userData.password);
	};

	const logout = async () => {
		await apiClient.logout();
		setUser(null);
	};

	const value: AuthContextType = {
		user,
		loading,
		login,
		register,
		logout,
		isAuthenticated,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

export function hasPermission(
	user: User | null,
	resource: string,
	action: string,
): boolean {
	if (!user) return false;

	switch (user.role) {
		case "super_admin":
		case "admin":
			return true;
		case "org_admin":
			return ["users", "agents", "organizations"].includes(resource);
		case "user":
			return (
				(resource === "users" && ["read", "update"].includes(action)) ||
				resource === "agents"
			);
		default:
			return false;
	}
}
