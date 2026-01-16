import { Loader2 } from 'lucide-react'

export function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Carregando...</p>
      </div>
    </div>
  )
}
