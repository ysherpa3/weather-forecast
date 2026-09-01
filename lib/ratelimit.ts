// ponytail: in-memory, per-instance counter. Serverless runs several instances, so the
// real ceiling is roughly limit x instances. Enough to stop a naive script from draining
// the paid OpenWeatherMap quota; move to a Vercel Firewall rate-limit rule (or Redis)
// if abuse is sustained.
const hits = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const LIMIT = 30;

export function rateLimit(request: Request, limit = LIMIT): boolean {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return true;
  }

  entry.count += 1;
  return entry.count <= limit;
}
