import { useState, useEffect, useCallback } from 'react'
import type { Theme } from '@/types'

/**
 * Hook options for useTheme
 */
export interface UseThemeOptions {
  /** Default theme to use */
  defaultTheme?: Theme
  /** Storage key for persisting theme */
  storageKey?: string
  /** Callback when theme changes */
  onThemeChange?: (theme: Theme) => void
}

/**
 * Hook return type
 */
export interface UseThemeReturn {
  /** Current theme */
  theme: Theme
  /** Resolved theme (system resolved to light/dark) */
  resolvedTheme: 'light' | 'dark'
  /** Set theme */
  setTheme: (theme: Theme) => void
  /** Toggle between light and dark */
  toggleTheme: () => void
  /** Check if dark mode is active */
  isDark: boolean
}

/**
 * Hook for managing theme state
 * Handles theme persistence, system preference detection, and document class updates
 */
export function useTheme(options: UseThemeOptions = {}): UseThemeReturn {
  const {
    defaultTheme = 'system',
    storageKey = 'theme',
    onThemeChange,
  } = options

  const getInitialTheme = useCallback((): Theme => {
    // Check localStorage first
    const stored = localStorage.getItem(storageKey)
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme
    }
    return defaultTheme
  }, [defaultTheme, storageKey])

  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  /**
   * Get the resolved theme (system resolves to light/dark)
   */
  const getResolvedTheme = useCallback((): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return theme
  }, [theme])

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getResolvedTheme)

  /**
   * Apply theme to document
   */
  const applyTheme = useCallback((resolved: 'light' | 'dark') => {
    const root = document.documentElement
    
    // Remove both classes first
    root.classList.remove('light', 'dark')
    
    // Add the resolved theme class
    root.classList.add(resolved)
    
    // Also set data attribute for CSS selectors
    root.setAttribute('data-theme', resolved)
  }, [])

  /**
   * Set theme and persist
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(storageKey, newTheme)
    onThemeChange?.(newTheme)
  }, [storageKey, onThemeChange])

  /**
   * Toggle between light and dark
   */
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [resolvedTheme, setTheme])

  // Update resolved theme when theme or system preference changes
  useEffect(() => {
    const resolved = getResolvedTheme()
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [theme, getResolvedTheme, applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light'
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, applyTheme])

  // Initial theme application on mount
  useEffect(() => {
    const resolved = getResolvedTheme()
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, []) // Run once on mount

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  }
}

/**
 * Hook for managing multiple color schemes
 */
export interface UseColorSchemeOptions {
  /** Default color scheme */
  defaultScheme?: string
  /** Storage key for persistence */
  storageKey?: string
}

export interface UseColorSchemeReturn {
  /** Current color scheme */
  scheme: string
  /** Available color schemes */
  schemes: string[]
  /** Set color scheme */
  setScheme: (scheme: string) => void
}

export function useColorScheme(options: UseColorSchemeOptions = {}): UseColorSchemeReturn {
  const {
    defaultScheme = 'default',
    storageKey = 'color-scheme',
  } = options

  const schemes = ['default', 'ocean', 'forest', 'sunset', 'midnight']

  const getInitialScheme = useCallback((): string => {
    const stored = localStorage.getItem(storageKey)
    if (stored && schemes.includes(stored)) {
      return stored
    }
    return defaultScheme
  }, [defaultScheme, storageKey])

  const [scheme, setSchemeState] = useState<string>(getInitialScheme)

  /**
   * Apply color scheme to document
   */
  const applyScheme = useCallback((newScheme: string) => {
    const root = document.documentElement
    schemes.forEach((s) => {
      root.classList.remove(`scheme-${s}`)
    })
    root.classList.add(`scheme-${newScheme}`)
    root.setAttribute('data-color-scheme', newScheme)
  }, [schemes])

  /**
   * Set color scheme and persist
   */
  const setScheme = useCallback((newScheme: string) => {
    if (!schemes.includes(newScheme)) {
      console.warn(`Invalid color scheme: ${newScheme}. Available: ${schemes.join(', ')}`)
      return
    }
    setSchemeState(newScheme)
    localStorage.setItem(storageKey, newScheme)
    applyScheme(newScheme)
  }, [storageKey, schemes, applyScheme])

  // Apply initial scheme on mount
  useEffect(() => {
    applyScheme(scheme)
  }, []) // Run once on mount

  return {
    scheme,
    schemes,
    setScheme,
  }
}

