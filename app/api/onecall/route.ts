import { NextRequest, NextResponse } from "next/server";
import { apiKey, owm } from "@/lib/openweathermap";
import {
  transformOnecall,
  type OWM4Envelope,
  type OWM4Current,
  type OWM4Hour,
  type OWM4Day,
} from "@/lib/onecall";
import { rateLimit } from "@/lib/ratelimit";

/** Validated before it reaches the upstream URL, so a crafted value can't append its own params. */
function coord(value: string | null, max: number): number | null {
  if (value === null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= max ? n : null;
}

type Fetched<T> = { ok: true; body: OWM4Envelope<T> } | { ok: false; error: string; status: number };

async function get<T>(url: string, revalidate: number): Promise<Fetched<T>> {
  let res: Response;
  let data: unknown;
  try {
    res = await fetch(url, { next: { revalidate } });
    data = await res.json();
  } catch {
    return { ok: false, error: "Failed to reach weather service", status: 502 };
  }
  if (!res.ok)
    return {
      ok: false,
      error: (data as { message?: string }).message ?? "Weather fetch failed",
      status: res.status,
    };
  return { ok: true, body: data as OWM4Envelope<T> };
}

export async function GET(request: NextRequest) {
  if (!rateLimit(request))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const lat = coord(searchParams.get("lat"), 90);
  const lon = coord(searchParams.get("lon"), 180);

  if (lat === null || lon === null)
    return NextResponse.json(
      { error: "lat and lon must be valid coordinates" },
      { status: 400 },
    );

  const key = apiKey();
  if (!key)
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 },
    );

  // One Call 4.0 serves current, hourly and daily from separate endpoints, so this is
  // three upstream calls per lookup. They are independent, so fetch them together.
  const [current, hourly, daily] = await Promise.all([
    get<OWM4Current>(owm.current(lat, lon, key), 300),
    get<OWM4Hour>(owm.hourly(lat, lon, key), 300),
    get<OWM4Day>(owm.daily(lat, lon, key), 900),
  ]);

  // Current conditions are the page; without them there is nothing to show. The two
  // forecasts are additive, so a failure there degrades to a card without them.
  if (!current.ok)
    return NextResponse.json(
      { error: current.error },
      { status: current.status },
    );

  const record = current.body.data?.[0];
  if (!record)
    return NextResponse.json(
      { error: "Weather service returned no current conditions" },
      { status: 502 },
    );

  return NextResponse.json(
    transformOnecall(
      record,
      hourly.ok ? (hourly.body.data ?? []) : [],
      daily.ok ? (daily.body.data ?? []) : [],
      current.body.timezone_offset,
    ),
  );
}
