import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with tailwind-merge for optimal class handling
 * Used throughout all components for conditional class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts CSS variables from the document root
 */
export function getCssVariable(name: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Check if a CSS variable is defined
 */
export function hasCssVariable(name: string): boolean {
  if (typeof window === 'undefined') return false
  const value = getComputedStyle(document.documentElement).getPropertyValue(name)
  return value !== ''
}

/**
 * Get all CSS variables as an object
 */
export function getAllCssVariables(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const styles = getComputedStyle(document.documentElement)
  const variables: Record<string, string> = {}
  
  // Common CSS variables to check
  const vars = [
    '--color-brand',
    '--color-primary',
    '--color-secondary',
    '--color-accent',
    '--color-destructive',
    '--color-background',
    '--color-foreground',
    '--color-muted',
    '--color-muted-foreground',
    '--color-border',
    '--color-input',
    '--color-ring',
    '--radius',
    '--font-sans',
    '--font-serif',
    '--font-mono',
  ]
  
  for (const v of vars) {
    const value = styles.getPropertyValue(v).trim()
    if (value) {
      variables[v] = value
    }
  }
  
  return variables
}

