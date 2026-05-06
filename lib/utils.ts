import type { Units } from "@/types/weather";

type Style = { background: string };

export function windDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export function humidityLabel(pct: number): string {
  if (pct < 30) return "Dry";
  if (pct < 60) return "Comfortable";
  if (pct < 80) return "Humid";
  return "Very Humid";
}

export function tempUnit(units: Units): string {
  return units === "metric" ? "°C" : "°F";
}

export function windUnit(units: Units): string {
  return units === "metric" ? "m/s" : "mph";
}

export function precipFromWeatherId(id: number): { pct: number; sub: string } {
  let pct: number;
  if (id >= 200 && id <= 699) pct = 100;
  else if (id === 800) pct = 0;
  else if (id === 801) pct = 10;
  else if (id === 802) pct = 20;
  else if (id === 803) pct = 35;
  else if (id === 804) pct = 45;
  else pct = 20;

  let sub = "Unlikely";
  if (id >= 200 && id <= 299) sub = "Thunderstorm";
  else if (id >= 300 && id <= 399) sub = "Drizzle";
  else if (id >= 500 && id <= 599) sub = "Rain";
  else if (id >= 600 && id <= 699) sub = "Snow";

  return { pct, sub };
}

export function getBackgroundStyle(weatherMain: string, isDay: boolean): Style {
  if (!isDay) {
    return {
      background:
        "linear-gradient(135deg, #05070f 0%, #070a18 50%, #050810 100%)",
    };
  }
  const gradients: Record<string, string> = {
    Clear: "linear-gradient(135deg, #0a1628 0%, #0d2040 50%, #152d52 100%)",
    Clouds: "linear-gradient(135deg, #0e1018 0%, #181b26 50%, #131620 100%)",
    Rain: "linear-gradient(135deg, #060c18 0%, #091628 50%, #070e1e 100%)",
    Drizzle: "linear-gradient(135deg, #080c18 0%, #0c1525 50%, #090e1c 100%)",
    Thunderstorm:
      "linear-gradient(135deg, #06050e 0%, #0b0814 50%, #070510 100%)",
    Snow: "linear-gradient(135deg, #0c1018 0%, #11182a 50%, #0e1422 100%)",
    Mist: "linear-gradient(135deg, #0c0e18 0%, #141626 50%, #0f1020 100%)",
    Fog: "linear-gradient(135deg, #0c0e18 0%, #141626 50%, #0f1020 100%)",
    Haze: "linear-gradient(135deg, #100e0c 0%, #181410 50%, #0e0c0a 100%)",
    Dust: "linear-gradient(135deg, #130d08 0%, #1b1008 50%, #100c06 100%)",
    Sand: "linear-gradient(135deg, #130d08 0%, #1b1008 50%, #100c06 100%)",
  };
  return { background: gradients[weatherMain] ?? gradients.Clear };
}

export const DEFAULT_BG: Style = {
  background: "linear-gradient(135deg, #0d1117 0%, #111520 50%, #0a0e16 100%)",
};
