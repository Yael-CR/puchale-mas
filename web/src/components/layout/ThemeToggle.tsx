
import { useAppDispatch } from '../../app/hooks/useAppDispatch'
import { useAppSelector } from '../../app/hooks/useAppSelector'
import {
  setThemePreference,
  type ThemePreference,
} from '../../features/preferences/store/preferencesSlice'

const themes: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]

function ThemeToggle() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.preferences.theme)

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-secondary p-1">
      {themes.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => dispatch(setThemePreference(option.value))}
          aria-pressed={theme === option.value}
          aria-label={`Usar tema ${option.label.toLowerCase()}`}
          className={`rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors ${
            theme === option.value
              ? 'bg-brand text-background'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeToggle
