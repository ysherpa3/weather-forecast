import { NextRequest, NextResponse } from "next/server";
import { apiKey, owm } from "@/lib/openweathermap";
import type { DailyItem } from "@/types/weather";

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
  hourly: Array<object>;
  daily: OWMDailySlot[];
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

  const res = await fetch(owm.onecall(lat, lon, units, key), {
    next: { revalidate: 300 },
  });
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      {
        error: (data as { message?: string }).message ?? "Weather fetch failed",
      },
      { status: res.status },
    );
  }

  const { timezone_offset, current, hourly, daily } =
    data as OWMOneCallResponse;

  const today = {
    tempMin: Math.round(daily[0].temp.min),
    tempMax: Math.round(daily[0].temp.max),
  };

  // daily[0] is today — skip it, take the next 7
  const days: DailyItem[] = daily.slice(1, 8).map((slot) => ({
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
    hourly: (hourly as Array<object>).slice(0, 12),
    today,
    days,
    timezone_offset,
  });
}
