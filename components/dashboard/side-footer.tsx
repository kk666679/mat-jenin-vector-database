"use client"

import Link from "next/link"
import { useMemo } from "react"

/**
 * Auth State Types
 */
export type Plan = "free" | "pro" | "enterprise"
export type Role = "admin" | "user" | "pro"

export type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | {
      status: "authenticated"
      user: {
        id: string
        name: string
        email: string
        role: Role
        avatarUrl?: string
        plan: Plan
      }
    }

/**
 * SideFooter Props
 */
interface SideFooterProps {
  auth: AuthState
  onLogout?: () => void
  className?: string
}

/**
 * SideFooter - Fixed vertical sidebar layout for dashboard
 * 
 * Features:
 * - User avatar with fallback initials
 * - User info (name, email, role badge)
 * - Navigation links
 * - Subscription plan section
 * - Conditional auth buttons (login/logout/signup)
 * - Loading, authenticated, and unauthenticated states
 * 
 * @example
 * ```tsx
 * <SideFooter 
 *   auth={{ status: "authenticated", user: { id: "1", name: "John", email: "john@example.com", role: "admin", plan: "pro" } }}
 *   onLogout={() => console.log("logout")}
 * />
 * ```
 */
export function SideFooter({ auth, onLogout, className }: SideFooterProps) {
  return (
    <aside
      className={className ?? "flex h-dvh w-72 flex-col border-r border-neutral-800 bg-neutral-950 px-6 py-8 text-sm text-neutral-200"}
      aria-label="Sidebar"
    >
      <UserSection auth={auth} />

      <nav className="mt-8 flex flex-col gap-2" aria-label="Main navigation">
        <NavItem href="/dashboard">Dashboard</NavItem>
        <NavItem href="/settings">Settings</NavItem>
        <NavItem href="/billing">Billing</NavItem>
        <NavItem href="/help">Help</NavItem>
      </nav>

      <div className="mt-auto space-y-6">
        <SubscriptionSection auth={auth} />
        <AuthSection auth={auth} onLogout={onLogout} />
      </div>
    </aside>
  )
}

/**
 * UserSection - Displays user information based on auth state
 */
function UserSection({ auth }: { auth: AuthState }) {
  if (auth.status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-800" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-800" />
          <div className="h-3 w-32 animate-pulse rounded bg-neutral-800" />
        </div>
      </div>
    )
  }

  if (auth.status === "unauthenticated") {
    return (
      <div className="text-neutral-400">
        <p className="font-medium">Welcome</p>
        <p className="text-xs">Please log in</p>
      </div>
    )
  }

  const { user } = auth

  return (
    <div className="flex items-center gap-3">
      <Avatar name={user.name} avatarUrl={user.avatarUrl} />
      <div className="flex flex-col">
        <span className="font-medium">{user.name}</span>
        <span className="text-xs text-neutral-400">{user.email}</span>
        <RoleBadge role={user.role} />
      </div>
    </div>
  )
}

/**
 * Avatar - User avatar with fallback initials
 */
function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string | undefined }) {
  const initials = useMemo(
    () =>
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    [name]
  )

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="h-12 w-12 rounded-full object-cover"
      />
    )
  }

  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-700 font-semibold"
      aria-label={`${name} avatar`}
    >
      {initials}
    </div>
  )
}

/**
 * RoleBadge - Displays user role with color coding
 */
function RoleBadge({ role }: { role: Role }) {
  const roleStyles = {
    admin: "bg-purple-600 text-white",
    pro: "bg-blue-600 text-white",
    user: "bg-neutral-600 text-neutral-200",
  }

  return (
    <span
      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${roleStyles[role]}`}
    >
      {role}
    </span>
  )
}

/**
 * SubscriptionSection - Shows current plan and upgrade option
 */
function SubscriptionSection({ auth }: { auth: AuthState }) {
  if (auth.status !== "authenticated") return null

  const { plan } = auth.user

  const planColors = {
    free: "text-neutral-400",
    pro: "text-blue-400",
    enterprise: "text-purple-400",
  }

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-400">
        Current Plan
      </p>
      <p className={`mt-1 font-medium capitalize ${planColors[plan]}`}>
        {plan}
      </p>

      {plan === "free" && (
        <Link
          href="/upgrade"
          className="mt-3 inline-block rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-200"
        >
          Upgrade
        </Link>
      )}
    </div>
  )
}

/**
 * AuthSection - Conditional login/logout/signup buttons
 */
function AuthSection({
  auth,
  onLogout,
}: {
  auth: AuthState
  onLogout: (() => void) | undefined
}) {
  if (auth.status === "loading") return null

  if (auth.status === "unauthenticated") {
    return (
      <div className="flex flex-col gap-2">
        <Link
          href="/login"
          className="rounded-md border border-neutral-700 px-3 py-2 text-center hover:bg-neutral-800"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-white px-3 py-2 text-center font-medium text-black hover:bg-neutral-200"
        >
          Sign Up
        </Link>
      </div>
    )
  }

  const handleLogout = onLogout ?? (() => {})

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-md border border-neutral-700 px-3 py-2 text-left hover:bg-neutral-800"
    >
      Logout
    </button>
  )
}

/**
 * NavItem - Navigation link item
 */
function NavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 hover:bg-neutral-800"
    >
      {children}
    </Link>
  )
}

