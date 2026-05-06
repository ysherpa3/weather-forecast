import { OWM_BASE, GEOCODE_LIMIT } from "@/constants";

export function apiKey(): string | null {
  const k = process.env.OPENWEATHERMAP_API_KEY;
  return !k || k === "your_api_key_here" ? null : k;
}

export const owm = {
  onecall: (lat: string, lon: string, units: string, k: string) =>
    `${OWM_BASE}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=${units}&appid=${k}`,

  geocode: (q: string, k: string) =>
    `${OWM_BASE}/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${GEOCODE_LIMIT}&appid=${k}`,
};
