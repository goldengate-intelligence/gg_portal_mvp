import React, { StrictMode } from 'react'
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
import { discoveryRoute, contractorDetailRoute, portfolioRoute } from './routes/platform-routes.tsx'
import { settingsRoutes } from './routes/settings-routes.tsx'

import Header from './components/Header'
import { PlatformFooter } from './components/platform/PlatformFooter'
import { AuthProvider } from './contexts/auth-context'
import { AgentChatProvider } from './contexts/agent-chat-context'
import { useLocation } from '@tanstack/react-router'

function ConditionalHeader() {
  const location = useLocation()
  const hideHeaderRoutes = []

  // Show header on all routes now
  if (hideHeaderRoutes.includes(location.pathname)) {
    return null
  }

  return <Header />
}

function ConditionalFooter() {
  const location = useLocation()
  const showFooterRoutes = ['/platform', '/dashboard', '/discovery', '/portfolio', '/contractor-detail', '/company-profile', '/uei-profile', '/contractor-network']

  // Show footer on all platform routes (everything except home, login, register)
  const shouldShowFooter = location.pathname === '/platform' ||
                          location.pathname === '/dashboard' ||
                          location.pathname.startsWith('/platform/') ||
                          location.pathname.startsWith('/settings/') ||
                          showFooterRoutes.some(route => location.pathname.startsWith(route))

  if (!shouldShowFooter) {
    return null
  }

  return <PlatformFooter />
}

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

import App from './App.tsx'

function RootComponent() {
  const location = useLocation()

  // Reset scroll position when route changes
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <ConditionalHeader />
      <Outlet />
      <ConditionalFooter />
    </>
  )
}

const rootRoute = createRootRoute({
  component: RootComponent,
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
  discoveryRoute(rootRoute),
  contractorDetailRoute(rootRoute),
  portfolioRoute(rootRoute),
  // Settings routes
  ...settingsRoutes.map(route => route(rootRoute)),
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
  scrollRestoration: false,
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
        <AgentChatProvider>
          <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
            <RouterProvider router={router} />
          </TanStackQueryProvider.Provider>
        </AgentChatProvider>
      </AuthProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
