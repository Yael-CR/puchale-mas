
import { useEffect, type ReactNode } from 'react'
import { Provider } from 'react-redux'

import { store } from '../store'
import { useAppSelector } from '../hooks/useAppSelector'

interface AppProvidersProps {
  children: ReactNode
}

function ThemeManager() {
  const theme = useAppSelector(
    (state) => state.preferences.theme,
  )

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }

    localStorage.setItem('puchale-theme', theme)
  }, [theme])

  return null
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeManager />
      {children}
    </Provider>
  )
}
