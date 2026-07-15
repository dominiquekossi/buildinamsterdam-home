/**
 * Prefixes a public asset path with the Vite base URL.
 * In dev it's "/", in production (GitHub Pages) it's "/buildinamsterdam-home/".
 * This ensures assets from /public resolve correctly regardless of deploy path.
 *
 * Usage: asset("/videos/showreel.mp4") → "/buildinamsterdam-home/videos/showreel.mp4"
 */
const BASE = import.meta.env.BASE_URL;

export function asset(path: string): string {
  // Remove leading slash from path to avoid double slashes
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${BASE}${clean}`;
}
