export function toErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const e = err as { message?: unknown; details?: unknown; code?: unknown; hint?: unknown };
    if (e.code && (e.message || e.details || e.hint)) {
      const parts = [e.message, e.hint, e.details].filter(
        (p) => typeof p === 'string' && p.length > 0
      );
      if (parts.length > 0) return parts.join(' · ');
    }
    if (typeof e.message === 'string' && e.message.length > 0) return e.message;
  }
  if (typeof err === 'string' && err.length > 0) return err;
  return fallback;
}