function apiBase() {
  return `http://${window.location.hostname}:9000`;
}

export function dashboardThumbnailUrl(value?: string): string | undefined {
  if (!value) return undefined;
  return `${apiBase()}/thumbnails/${encodeURIComponent(value)}`;
}
