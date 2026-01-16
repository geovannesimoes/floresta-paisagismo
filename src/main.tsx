/* Main entry point for the application - Bootstraps configuration before rendering */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { SplashScreen } from '@/components/SplashScreen'
import { siteSettingsService } from '@/services/siteSettingsService'
import { applyTheme } from '@/lib/utils'
import './main.css'

const preloadImage = (url: string) => {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.src = url
    img.onload = () => resolve()
    img.onerror = () => resolve() // Don't block if image fails
  })
}

const bootstrap = async () => {
  const container = document.getElementById('root')!
  const root = createRoot(container)

  // 1. Try to get settings from local cache first (Synchronous check)
  let settings = siteSettingsService.getCachedSettings()

  // 2. If no cache, render splash and fetch from server
  if (!settings) {
    root.render(<SplashScreen />)

    try {
      const { data } = await siteSettingsService.getSettings()
      if (data) {
        settings = data
        siteSettingsService.cacheSettings(data)
      }
    } catch (error) {
      console.error('Failed to bootstrap settings:', error)
    }
  }

  // 3. Apply theme settings immediately
  if (settings) {
    applyTheme(settings)

    // 4. Preload critical brand assets (Logo) to prevent popping
    if (settings.logo_url) {
      // Use a timeout race to ensure we don't wait forever
      const timeoutPromise = new Promise<void>((resolve) =>
        setTimeout(resolve, 2000),
      )
      await Promise.race([preloadImage(settings.logo_url), timeoutPromise])
    }
  }

  // 5. Render the main application
  root.render(<App />)
}

bootstrap()
