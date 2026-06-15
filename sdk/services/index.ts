/**
 * SDK Services
 *
 * High-level business logic shared across transports (tRPC, gRPC, REST).
 * These services compose the lower-level SDK modules (db, vector, llm) so
 * that behaviour stays identical regardless of how a request arrives.
 */

export * from './rag';
