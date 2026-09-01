import { NextRequest, NextResponse } from "next/server";
import { apiKey, owm } from "@/lib/openweathermap";
import { transformOnecall, type OWMOneCallResponse } from "@/lib/onecall";
import { rateLimit } from "@/lib/ratelimit";

/** Validated before it reaches the upstream URL, so a crafted value can't append its own params. */
function coord(value: string | null, max: number): number | null {
  if (value === null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= max ? n : null;
}

export async function GET(request: NextRequest) {
  if (!rateLimit(request))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const lat = coord(searchParams.get("lat"), 90);
  const lon = coord(searchParams.get("lon"), 180);
  const units =
    searchParams.get("units") === "imperial" ? "imperial" : "metric";

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

  return NextResponse.json(transformOnecall(data as OWMOneCallResponse));
}
