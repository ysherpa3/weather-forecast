const OWM_BASE = "https://api.openweathermap.org";
const GEOCODE_LIMIT = 5;

export function apiKey(): string | null {
  const k = process.env.OPENWEATHERMAP_API_KEY;
  return !k || k === "your_api_key_here" ? null : k;
}

export const owm = {
  // Always metric — the client converts for display, so one cached response serves both units.
  onecall: (lat: number, lon: number, k: string) =>
    `${OWM_BASE}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${k}`,

  geocode: (q: string, k: string) =>
    `${OWM_BASE}/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${GEOCODE_LIMIT}&appid=${k}`,
};
