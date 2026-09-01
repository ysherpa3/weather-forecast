import { NextRequest, NextResponse } from "next/server";
import { apiKey, owm } from "@/lib/openweathermap";
import { precipType } from "@/lib/utils";
import type { DailyItem, OnecallHourly } from "@/types/weather";

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

interface OWMOneCallResponse {
  timezone_offset: number;
  current: object;
  hourly?: OnecallHourly[];
  daily?: OWMDailySlot[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const units =
    searchParams.get("units") === "imperial" ? "imperial" : "metric";

  if (!lat || !lon)
    return NextResponse.json(
      { error: "lat and lon are required" },
      { status: 400 },
    );

  const key = apiKey();
  if (!key)
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 },
    );

  let res: Response;
  let data: unknown;
  try {
    res = await fetch(owm.onecall(lat, lon, units, key), {
      next: { revalidate: 300 },
    });
    data = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Failed to reach weather service" },
      { status: 502 },
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      {
        error:
          (data as { message?: string }).message ?? "Weather fetch failed",
      },
      { status: res.status },
    );
  }

  const { timezone_offset, current, hourly, daily } =
    data as OWMOneCallResponse;

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

  return NextResponse.json({
    current,
    hourly: hourlySlots.slice(0, 12),
    today,
    days,
    precip,
    timezone_offset,
  });
}
