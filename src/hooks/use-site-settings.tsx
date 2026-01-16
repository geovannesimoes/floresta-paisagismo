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
import { applyTheme } from '@/lib/utils'

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
  // Initialize with cached settings if available to prevent flicker
  const [settings, setSettings] = useState<SiteSettings | null>(() => {
    return siteSettingsService.getCachedSettings()
  })
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const { data } = await siteSettingsService.getSettings()
      if (data) {
        setSettings(data)
        siteSettingsService.cacheSettings(data)
        applyTheme(data)
      }
    } catch (error) {
      console.error('Failed to fetch site settings', error)
    } finally {
      setLoading(false)
    }
  }

  // Effect to re-fetch/validate even if we have cache
  useEffect(() => {
    fetchSettings()
  }, [])

  // Apply theme if settings exist initially (double check)
  useEffect(() => {
    if (settings) {
      applyTheme(settings)
    }
  }, [settings])

  return (
    <SiteSettingsContext.Provider
      value={{ settings, loading, refreshSettings: fetchSettings }}
    >
      {children}
    </SiteSettingsContext.Provider>
  )
}
