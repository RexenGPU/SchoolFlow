const LOCAL_PRONOTE_SERVER = 'http://127.0.0.1:3210'

/**
 * The standalone build is opened with file:// and therefore cannot resolve
 * relative /api URLs. In that mode, use the local companion server. When the
 * app is served normally, keep the relative URL so the reverse proxy can be
 * used.
 */
export function pronoteApiUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return `${LOCAL_PRONOTE_SERVER}${path}`
  }
  return path
}
