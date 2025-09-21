import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import FormSimpleDemo from './routes/demo.form.simple.tsx'
import FormAddressDemo from './routes/demo.form.address.tsx'
import TableDemo from './routes/demo.table.tsx'
import TanStackQueryDemo from './routes/demo.tanstack-query.tsx'
import LoginRoute from './routes/login.tsx'
import RegisterRoute from './routes/register.tsx'
import DashboardRoute from './routes/dashboard.tsx'
import PlatformRoute from './routes/platform.tsx'
import { companyProfileRoute, ueiProfileRoute, contractorNetworkRoute, contractorDetailRoute } from './routes/platform-routes.tsx'

import Header from './components/Header'
import { AuthProvider } from './contexts/auth-context'
import { useLocation } from '@tanstack/react-router'

function ConditionalHeader() {
  const location = useLocation()
  const hideHeaderRoutes = ['/dashboard', '/platform']
  
  // Hide header on platform routes and contractor detail pages
  if (hideHeaderRoutes.includes(location.pathname) || location.pathname.startsWith('/platform/')) {
    return null
  }
  
  return <Header />
}

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

import App from './App.tsx'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <ConditionalHeader />
      <Outlet />
    </>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  LoginRoute(rootRoute),
  RegisterRoute(rootRoute),
  DashboardRoute(rootRoute),
  PlatformRoute(rootRoute),
  companyProfileRoute(rootRoute),
  ueiProfileRoute(rootRoute),
  contractorNetworkRoute(rootRoute),
  contractorDetailRoute(rootRoute),
  FormSimpleDemo(rootRoute),
  FormAddressDemo(rootRoute),
  TableDemo(rootRoute),
  TanStackQueryDemo(rootRoute),
])

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <AuthProvider>
        <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
          <RouterProvider router={router} />
        </TanStackQueryProvider.Provider>
      </AuthProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
