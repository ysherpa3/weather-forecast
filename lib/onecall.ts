import { precipType } from "./utils.ts";
import type { DailyItem, OnecallData, OnecallHourly } from "@/types/weather";

/** Every One Call 4.0 endpoint wraps its records in the same envelope. */
export interface OWM4Envelope<T> {
  timezone_offset: number;
  data?: T[];
}

interface OWMWeather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OWM4Current {
  dt: number;
  // Absent in polar regions during midnight sun and polar night.
  sunrise?: number;
  sunset?: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  weather: OWMWeather[];
  rain?: { "1h": number };
  snow?: { "1h": number };
}

export interface OWM4Hour {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  pop: number;
  weather: OWMWeather[];
}

export interface OWM4Day {
  dt: number;
  temp: { day: number; min: number; max: number };
  pop: number;
  weather: OWMWeather[];
}

/** Shrink the three One Call 4.0 payloads to what the UI renders. */
export function transformOnecall(
  current: OWM4Current,
  hours: OWM4Hour[],
  days: OWM4Day[],
  timezoneOffset: number,
): OnecallData {
  // Either forecast endpoint can fail or come back empty without the current
  // conditions being unusable, so both degrade to nothing rather than throwing.
  const hourSlots = hours ?? [];
  const daySlots = days ?? [];

  // Temperatures stay unrounded and in Celsius; the client converts and rounds at
  // display time, so toggling units costs no refetch.
  const today = daySlots[0]
    ? { tempMin: daySlots[0].temp.min, tempMax: daySlots[0].temp.max }
    : null;

  // real precipitation probability for the coming hour, not a guess from the condition code
  const nextHour = hourSlots[0];
  const precip = nextHour
    ? {
        pct: Math.round(nextHour.pop * 100),
        type: precipType(nextHour.weather[0].id),
      }
    : null;

  // data[0] is today — skip it, take the next 7
  const forecast: DailyItem[] = daySlots.slice(1, 8).map((slot) => ({
    dateLabel: new Date((slot.dt + timezoneOffset) * 1000).toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      },
    ),
    tempMin: slot.temp.min,
    tempMax: slot.temp.max,
    weather: slot.weather[0],
    popMax: slot.pop,
  }));

  return {
    current,
    hourly: hourSlots.slice(0, 12) as OnecallHourly[],
    today,
    days: forecast,
    precip,
    timezone_offset: timezoneOffset,
  };
}
