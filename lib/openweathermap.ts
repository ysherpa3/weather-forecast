const OWM_BASE = "https://api.openweathermap.org";
const OWM4 = `${OWM_BASE}/data/4.0/onecall`;
const GEOCODE_LIMIT = 5;

export function apiKey(): string | null {
  const k = process.env.OPENWEATHERMAP_API_KEY;
  return !k || k === "your_api_key_here" ? null : k;
}

// One Call 4.0 splits current/hourly/daily across three endpoints, so a lookup costs
// three calls. Always metric — the client converts for display, so one cached set of
// responses serves both units.
//
// Record limits: the 1h timeline returns up to 20 and the 1day up to 10, and we need 12
// and 8. Everything fits in one page per endpoint, so the paginated next/prev links are
// never followed — each of those would bill as another call.
export const owm = {
  current: (lat: number, lon: number, k: string) =>
    `${OWM4}/current?lat=${lat}&lon=${lon}&units=metric&appid=${k}`,

  hourly: (lat: number, lon: number, k: string) =>
    `${OWM4}/timeline/1h?lat=${lat}&lon=${lon}&units=metric&appid=${k}`,

  daily: (lat: number, lon: number, k: string) =>
    `${OWM4}/timeline/1day?lat=${lat}&lon=${lon}&units=metric&appid=${k}`,

  geocode: (q: string, k: string) =>
    `${OWM_BASE}/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${GEOCODE_LIMIT}&appid=${k}`,
};
