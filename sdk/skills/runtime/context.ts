export interface SkillContext {
  tenantId: string;
  userId?: string;
  sessionId?: string;
  requestId: string;
  /** Arbitrary metadata useful for debugging/tracing */
  metadata?: Record<string, unknown>;
  /** ISO timestamp */
  timestamp: string;
}

