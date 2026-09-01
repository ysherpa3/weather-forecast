import { precipType } from "./utils.ts";
import type { DailyItem, OnecallData, OnecallHourly } from "@/types/weather";

interface OWMDailySlot {
  dt: number;
  temp: { min: number; max: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  pop: number;
}

export interface OWMOneCallResponse {
  timezone_offset: number;
  current: object;
  hourly?: OnecallHourly[];
  daily?: OWMDailySlot[];
}

/** Shrink OWM's One Call payload to what the UI actually renders. */
export function transformOnecall(data: OWMOneCallResponse): OnecallData {
  const { timezone_offset, current, hourly, daily } = data;

  // OWM can omit daily/hourly entirely for some coords/plans — don't crash on it
  const dailySlots = daily ?? [];
  const hourlySlots = hourly ?? [];

  const today = dailySlots[0]
    ? {
        tempMin: Math.round(dailySlots[0].temp.min),
        tempMax: Math.round(dailySlots[0].temp.max),
      }
    : null;

  // real precipitation probability for the coming hour, not a guess from the condition code
  const nextHour = hourlySlots[0];
  const precip = nextHour
    ? {
        pct: Math.round(nextHour.pop * 100),
        type: precipType(nextHour.weather[0].id),
      }
    : null;

  // daily[0] is today — skip it, take the next 7
  const days: DailyItem[] = dailySlots.slice(1, 8).map((slot) => ({
    dateLabel: new Date((slot.dt + timezone_offset) * 1000).toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      },
    ),
    tempMin: Math.round(slot.temp.min),
    tempMax: Math.round(slot.temp.max),
    weather: slot.weather[0],
    popMax: slot.pop,
  }));

  return {
    current: current as OnecallData["current"],
    hourly: hourlySlots.slice(0, 12),
    today,
    days,
    precip,
    timezone_offset,
  };
}
