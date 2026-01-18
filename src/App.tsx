import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
} from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import { AuthProvider } from './hooks/use-auth'
import { SiteSettingsProvider } from './hooks/use-site-settings'
import { ErrorBoundary } from './components/ErrorBoundary' // Added

import Index from './pages/Index'
import Planos from './pages/Planos'
import Projetos from './pages/Projetos'
import ProjetoDetalhe from './pages/ProjetoDetalhe'
import Pedido from './pages/Pedido'
import Pagamento from './pages/Pagamento'
import PagamentoSucesso from './pages/PagamentoSucesso'
import PagamentoCancelado from './pages/PagamentoCancelado'
import PagamentoExpirado from './pages/PagamentoExpirado'
import AreaCliente from './pages/AreaCliente'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import NotFound from './pages/NotFound'

const RootWrapper = () => {
  return (
    <AuthProvider>
      <SiteSettingsProvider>
        <ScrollRestoration />
        <Toaster />
        <Sonner />
        <Outlet />
      </SiteSettingsProvider>
    </AuthProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <RootWrapper />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <Index /> },
          { path: '/planos', element: <Planos /> },
          { path: '/projetos', element: <Projetos /> },
          { path: '/projetos/:id', element: <ProjetoDetalhe /> },
          { path: '/pedido', element: <Pedido /> },
          { path: '/pagamento', element: <Pagamento /> },
          { path: '/pagamento/sucesso', element: <PagamentoSucesso /> },
          { path: '/pagamento/cancelado', element: <PagamentoCancelado /> },
          { path: '/pagamento/expirado', element: <PagamentoExpirado /> },
          { path: '/area-cliente', element: <AreaCliente /> },
        ],
      },
      {
        path: '/admin',
        element: (
          <ErrorBoundary>
            <Admin />
          </ErrorBoundary>
        ),
      },
      {
        path: '/admin/login',
        element: (
          <ErrorBoundary>
            <AdminLogin />
          </ErrorBoundary>
        ),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])

const App = () => (
  <TooltipProvider>
    <RouterProvider router={router} />
  </TooltipProvider>
)

export default App
