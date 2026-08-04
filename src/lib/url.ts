// Astro's BASE_URL isn't guaranteed a trailing slash — normalize once here
// rather than re-deriving it at every internal link site.
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${path.replace(/^\//, '')}`;
}
