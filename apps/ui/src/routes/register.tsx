import { createRoute } from "@tanstack/react-router";
import { RegisterForm } from "../components/auth/register-form";

export const registerRoute = (rootRoute: any) =>
	createRoute({
		getParentRoute: () => rootRoute,
		path: "/register",
		component: RegisterForm,
	});

export default registerRoute;
