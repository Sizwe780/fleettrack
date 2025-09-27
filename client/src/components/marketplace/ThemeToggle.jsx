// ThemeToggle.jsx
import { useContext } from 'react'
import { ThemeContext } from './ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext)

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="px-3 py-1 rounded border"
    >
      {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  )
}