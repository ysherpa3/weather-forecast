import { NextRequest, NextResponse } from "next/server";
import { apiKey, owm } from "@/lib/openweathermap";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) return NextResponse.json([]);

  const key = apiKey();
  if (!key)
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 },
    );

  const res = await fetch(owm.geocode(q, key), { next: { revalidate: 60 } });
  const data = await res.json();

  if (!res.ok)
    return NextResponse.json(
      { error: data.message ?? "Geocoding failed" },
      { status: res.status },
    );

  return NextResponse.json(data);
}
