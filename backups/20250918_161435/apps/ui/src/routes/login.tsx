import { createRoute } from '@tanstack/react-router';
import { LoginForm } from '../components/auth/login-form';

export const loginRoute = (rootRoute: any) => createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginForm,
});

export default loginRoute;