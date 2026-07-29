/**
 * Best-effort client IP extraction for rate limiting in Route Handlers.
 *
 * Next.js Route Handlers do not expose a reliable `request.ip` field across
 * hosting providers, so we read the common reverse-proxy headers instead.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    if (first && first.trim()) {
      return first.trim();
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }

  return "unknown";
}
