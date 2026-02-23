/**
 * Dashboard Components
 * 
 * Reusable components for building dashboard interfaces.
 * 
 * @example
 * ```tsx
 * import { SideFooter, Sidebar, StatCard, DataTable, DashboardCharts, PrismaStudioEmbed } from '@/components/dashboard';
 * ```
 */

// Main components
export { SideFooter } from './side-footer'
export { Sidebar } from './sidebar'
export { StatCard } from './StatCard'
export { DataTable } from './DataTable'
export { DashboardCharts, StatusBadge, ProgressBar } from './DashboardCharts'
export { PrismaStudioEmbed, StudioStatus, SecurityWarning } from './PrismaStudioEmbed'

// Re-export types for convenience
export type { Column } from './DataTable'
export type { AuthState, Plan, Role } from './side-footer'

