# Weather App

Current conditions and a 7-day forecast for any city, powered by
[OpenWeatherMap](https://openweathermap.org/).

Search for a city, and the app shows current temperature and conditions,
feels-like, humidity, wind, precipitation probability, sunrise and sunset,
plus expandable hourly and 7-day forecasts. Temperatures can be switched
between Celsius and Fahrenheit.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand

## Requirements

- Node 22.18 or newer. The tests are TypeScript files run directly by Node,
  which needs its built-in type stripping.
- An [OpenWeatherMap One Call 4.0](https://openweathermap.org/api/one-call-4)
  subscription. It is subscribed to separately from the standard API plans and
  includes 1,000 calls per day at no cost.

## Setup

```bash
pnpm install
```

Add your API key to `.env.local`:

```
OPENWEATHERMAP_API_KEY=your_key_here
```

```bash
pnpm dev
```

The app runs at http://localhost:3000.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run the test suite |

## Layout

```
app/           Routes, layout, and the API routes under app/api
components/    WeatherDashboard, plus search/, weather/, and ui/
hooks/         Data fetching and debouncing
lib/           API client, response transform, rate limiting, helpers
store/         Zustand store for selected city and unit preference
types/         Shared response and domain types
```

## How it works

The OpenWeatherMap key never reaches the browser. Two server routes proxy the
upstream API:

- `GET /api/geocode?q=` — city search, cached for 60 seconds
- `GET /api/onecall?lat=&lon=` — weather

One Call 4.0 serves current conditions, the hourly timeline and the daily
timeline from three separate endpoints, so `/api/onecall` fetches all three in
parallel and merges them into one small response shaped for the UI. They are
cached for 300, 300 and 900 seconds respectively.

That means **one city lookup costs three upstream calls**, so the 1,000 free
calls per day work out to roughly 330 lookups. The forecast timelines return
more records than the UI needs (20 hourly, 10 daily, against 12 and 8), so the
paginated `next`/`prev` links are never followed — each one would bill as a
further call.

If either forecast endpoint fails the card still renders with current
conditions; only the current endpoint is required.

Both routes are rate limited to 30 requests per minute per IP. The limiter is
in-memory and therefore per-instance, which caps casual abuse of the API quota
but is not a substitute for a platform-level rate limit rule.

Weather is always requested in metric. Converting to Fahrenheit happens at
display time, so switching units is instant and costs no request.
