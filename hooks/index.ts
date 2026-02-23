// ============================================
// REACT HOOKS
// Custom hooks for the application
// ============================================

// Re-export all hooks
export * from './use-chat'
export * from './use-debounce'
export * from './use-documents'
export * from './use-pagination'
export * from './use-theme'

// Re-export types/interfaces from hooks
export type {
  UseChatOptions,
  UseChatReturn,
} from './use-chat'

export type {
  UseDocumentsOptions,
  UseDocumentsReturn,
} from './use-documents'

export type {
  UsePaginationOptions,
  UsePaginationReturn,
} from './use-pagination'

export type {
  UseThemeOptions,
  UseThemeReturn,
  UseColorSchemeOptions,
  UseColorSchemeReturn,
} from './use-theme'

