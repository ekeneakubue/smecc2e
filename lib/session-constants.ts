/** Shared between client idle guard and server session verification. */
export const SESSION_IDLE_TIMEOUT_MS = 10 * 60 * 1000;

/** Throttle server session refresh while the user is active. */
export const SESSION_HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;
