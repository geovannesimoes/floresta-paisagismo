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

import Index from './pages/Index'
import Planos from './pages/Planos'
import Projetos from './pages/Projetos'
import Pedido from './pages/Pedido'
import Pagamento from './pages/Pagamento'
import AreaCliente from './pages/AreaCliente'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

const RootWrapper = () => {
  return (
    <>
      <ScrollRestoration />
      <Toaster />
      <Sonner />
      <Outlet />
    </>
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
          { path: '/pedido', element: <Pedido /> },
          { path: '/pagamento', element: <Pagamento /> },
          { path: '/area-cliente', element: <AreaCliente /> },
        ],
      },
      {
        path: '/admin',
        element: <Admin />,
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
