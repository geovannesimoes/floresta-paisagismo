import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  siteSettingsService,
  SiteSettings,
} from '@/services/siteSettingsService'

interface SiteSettingsContextType {
  settings: SiteSettings | null
  loading: boolean
  refreshSettings: () => Promise<void>
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(
  undefined,
)

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext)
  if (context === undefined) {
    throw new Error(
      'useSiteSettings must be used within a SiteSettingsProvider',
    )
  }
  return context
}

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const { data } = await siteSettingsService.getSettings()
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch site settings', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SiteSettingsContext.Provider
      value={{ settings, loading, refreshSettings: fetchSettings }}
    >
      {children}
    </SiteSettingsContext.Provider>
  )
}
