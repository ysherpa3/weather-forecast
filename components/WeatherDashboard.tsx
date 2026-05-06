"use client";

import { CSSProperties } from "react";
import SearchBar from "./search/SearchBar";
import CurrentWeather from "./weather/CurrentWeather";
import HourlyForecast from "./weather/HourlyForecast";
import DailyForecast from "./weather/DailyForecast";
import Card from "./ui/Card";
import { WeatherSkeleton } from "./ui/Skeleton";
import { useOnecall } from "@/hooks/useOnecall";
import { useWeatherStore } from "@/store/weatherStore";
import { getBackgroundStyle, DEFAULT_BG } from "@/lib/utils";
import type { GeocodingResult } from "@/types/location";

export default function WeatherDashboard() {
  const { selectedCity, setSelectedCity, units, setUnits } = useWeatherStore();

  const lat = selectedCity?.lat ?? null;
  const lon = selectedCity?.lon ?? null;
  const { data, isLoading, error } = useOnecall(lat, lon, units);

  const isDay = data
    ? data.current.dt >= data.current.sunrise &&
      data.current.dt <= data.current.sunset
    : true;
  const bgStyle: CSSProperties = data
    ? getBackgroundStyle(data.current.weather[0].main, isDay)
    : DEFAULT_BG;

  const toggleUnits = () =>
    setUnits(units === "metric" ? "imperial" : "metric");
  const handleCitySelect = (city: GeocodingResult) => setSelectedCity(city);

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6" style={bgStyle}>
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white tracking-tight">Weather</h1>
        {selectedCity && (
          <button
            onClick={toggleUnits}
            className="flex items-center gap-1.5 min-h-9 bg-white/10 backdrop-blur-sm border border-white/15 shadow-sm rounded-lg px-3 text-sm font-medium cursor-pointer hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label={
              units === "metric"
                ? "Units: Celsius — switch to Fahrenheit"
                : "Units: Fahrenheit — switch to Celsius"
            }
          >
            <span
              className={
                units === "metric"
                  ? "text-white font-semibold"
                  : "text-white/55"
              }
            >
              °C
            </span>
            <span className="text-white/20 select-none" aria-hidden="true">
              /
            </span>
            <span
              className={
                units === "imperial"
                  ? "text-white font-semibold"
                  : "text-white/55"
              }
            >
              °F
            </span>
          </button>
        )}
      </header>

      <main
        id="main-content"
        className="flex-1 flex flex-col items-center justify-center w-full gap-6 sm:gap-8 max-w-lg mx-auto py-6"
      >
        <SearchBar onSelect={handleCitySelect} />

        {!selectedCity && (
          <p className="text-white/55 text-sm text-center">
            Search for a city to get started
          </p>
        )}

        {selectedCity && isLoading && <WeatherSkeleton />}

        {selectedCity && error && !isLoading && (
          <div
            role="alert"
            className="rounded-xl bg-red-950/60 backdrop-blur-sm border border-red-500/30 text-red-300 px-5 py-4 w-full text-center text-sm"
          >
            {error}
          </div>
        )}

        {data && !isLoading && selectedCity && (
          <Card>
            <CurrentWeather
              current={data.current}
              timezone={data.timezone_offset}
              name={selectedCity.name}
              country={selectedCity.country}
              units={units}
              todayHighLow={data.today}
            />
            <HourlyForecast
              hourly={data.hourly}
              timezone={data.timezone_offset}
              units={units}
            />
            <DailyForecast days={data.days} units={units} />
          </Card>
        )}
      </main>
    </div>
  );
}
