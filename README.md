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
- An [OpenWeatherMap One Call](https://openweathermap.org/api/one-call-3)
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
- `GET /api/onecall?lat=&lon=` — weather, cached for 300 seconds

`/api/onecall` trims the upstream payload to what the UI renders, so the
client receives one small response instead of the full One Call document.

Both routes are rate limited to 30 requests per minute per IP. The limiter is
in-memory and therefore per-instance, which caps casual abuse of the API quota
but is not a substitute for a platform-level rate limit rule.

Weather is always requested in metric. Converting to Fahrenheit happens at
display time, so switching units is instant and costs no request.
