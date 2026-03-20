import { ref, watch } from 'vue'

const STORAGE_KEY = 'ea-army-builder:theme'

/**
 * Gets the initial dark mode preference:
 * 1. Check localStorage for saved preference
 * 2. Fall back to system preference (prefers-color-scheme)
 * 3. Default to dark mode if neither is available
 */
function getInitialDarkMode(): boolean {
  // Check localStorage first
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) {
    return stored === 'dark'
  }

  // Check system preference
  if (window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
    if (prefersDark.media !== 'not all') {
      return prefersDark.matches
    }
  }

  // Default to dark mode
  return true
}

// Shared reactive state
const isDark = ref<boolean>(getInitialDarkMode())

// Apply initial dark mode class to body element  
if (isDark.value) {
  document.body.classList.add('dark')
} else {
  document.body.classList.remove('dark')
}

// Watch for changes and update both localStorage and DOM
watch(isDark, (newValue) => {
  localStorage.setItem(STORAGE_KEY, newValue ? 'dark' : 'light')
  if (newValue) {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }
})

export function useTheme() {
  function toggleDarkMode() {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleDarkMode,
  }
}
