
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ThemePreference = 'light' | 'dark' | 'system'

interface PreferencesState {
  theme: ThemePreference
}

function getInitialTheme(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system'
  }

  const savedTheme = localStorage.getItem('puchale-theme')

  if (
    savedTheme === 'light' ||
    savedTheme === 'dark' ||
    savedTheme === 'system'
  ) {
    return savedTheme
  }

  return 'system'
}

const initialState: PreferencesState = {
  theme: getInitialTheme(),
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setThemePreference: (
      state,
      action: PayloadAction<ThemePreference>,
    ) => {
      state.theme = action.payload
    },
  },
})

export const { setThemePreference } = preferencesSlice.actions

export default preferencesSlice.reducer
