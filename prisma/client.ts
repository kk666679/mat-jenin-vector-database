/**
 * Prisma Client (compatibility re-export)
 *
 * The canonical Prisma client now lives in `sdk/db/prisma.ts` so the whole
 * application shares a single connection pool / singleton. This module is
 * kept as a thin re-export for backwards compatibility — prefer importing
 * from `@/sdk/db` or `@/sdk` in new code.
 */

export * from '@/sdk/db/prisma';
