/**
 * Tiny artificial latency so the mock data layer exercises loading/skeleton
 * states and the swap to a real async API is seamless.
 */
let enabled = true;

export function setLatencyEnabled(v: boolean) {
  enabled = v;
}

export function latency(min = 90, max = 240): Promise<void> {
  if (!enabled) return Promise.resolve();
  const ms = Math.floor(min + Math.random() * (max - min));
  return new Promise((resolve) => setTimeout(resolve, ms));
}
