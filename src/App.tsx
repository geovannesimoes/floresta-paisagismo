import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/pedido" element={<Pedido />} />
          <Route path="/pagamento" element={<Pagamento />} />
          <Route path="/area-cliente" element={<AreaCliente />} />
        </Route>

        {/* Admin route without main layout for simplicity or use layout if preferred */}
        <Route path="/admin" element={<Admin />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
