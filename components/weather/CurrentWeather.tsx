import { ReactNode } from "react";
import Image from "next/image";
import type { OnecallCurrent, Units } from "@/types/weather";
import {
  Droplets,
  CloudRain,
  Sunrise,
  Sunset,
  Navigation2,
} from "lucide-react";
import {
  windDirection,
  humidityLabel,
  precipFromWeatherId,
  tempUnit,
  windUnit,
} from "@/lib/utils";

interface Props {
  current: OnecallCurrent;
  timezone: number;
  name: string;
  country: string;
  units: Units;
  todayHighLow?: { tempMin: number; tempMax: number } | null;
}

function Detail({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-white/6 border border-white/8 rounded-xl p-3">
      <div className="flex items-center gap-1.5">
        <div className="text-amber-400 shrink-0" aria-hidden="true">
          {icon}
        </div>
        <span className="text-white/55 text-xs uppercase tracking-wide font-medium truncate">
          {label}
        </span>
      </div>
      <div className="text-white font-semibold text-sm tabular-nums leading-tight">
        {value}
      </div>
      {sub && <div className="text-white/60 text-xs leading-tight">{sub}</div>}
    </div>
  );
}

export default function CurrentWeather({
  current,
  timezone,
  name,
  country,
  units,
  todayHighLow,
}: Props) {
  const weather = current.weather[0];
  const localTime = new Date((current.dt + timezone) * 1000);
  const tUnit = tempUnit(units);
  const wUnit = windUnit(units);

  const dateStr = localTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const timeStr = localTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  const sunriseStr = new Date(
    (current.sunrise + timezone) * 1000,
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  const sunsetStr = new Date(
    (current.sunset + timezone) * 1000,
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  const feelsDiff = Math.round(current.feels_like) - Math.round(current.temp);
  const feelsContext =
    feelsDiff === 0
      ? "Same as actual"
      : feelsDiff > 0
        ? `${feelsDiff}° warmer`
        : `${Math.abs(feelsDiff)}° cooler`;

  const { pct: precipPct, sub: precipSub } = precipFromWeatherId(weather.id);
  const precipSubFinal = current.rain?.["1h"]
    ? "Rain"
    : current.snow?.["1h"]
      ? "Snow"
      : precipSub;

  return (
    <>
      <div className="flex items-start justify-between px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
            {name}, {country}
          </h2>
          <p className="text-white/55 text-sm mt-0.5">
            {dateStr} · {timeStr}
          </p>
        </div>
        <Image
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
          width={72}
          height={72}
          className="-mt-1 -mr-1 sm:w-20 sm:h-20 opacity-90"
          unoptimized
          priority
        />
      </div>

      <div className="h-px bg-white/8" />

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="text-6xl sm:text-7xl font-light text-white tracking-tight leading-none tabular-nums">
          {Math.round(current.temp)}°
        </div>
        <div className="text-base text-white/80 mt-2 capitalize font-medium">
          {weather.description}
        </div>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-sm text-white/60">
            Feels like {Math.round(current.feels_like)}
            {tUnit}
          </span>
          <span className="text-white/20 select-none" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-white/55">{feelsContext}</span>
        </div>
        {todayHighLow && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm text-white/70 tabular-nums">
              <span className="sr-only">High: </span>H: {todayHighLow.tempMax}
              {tUnit}
            </span>
            <span className="text-white/20 select-none" aria-hidden="true">
              ·
            </span>
            <span className="text-sm text-white/55 tabular-nums">
              <span className="sr-only">Low: </span>L: {todayHighLow.tempMin}
              {tUnit}
            </span>
          </div>
        )}
      </div>

      <div className="h-px bg-white/8" />

      <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-2.5 sm:space-y-3">
        <div className="bg-white/6 border border-white/8 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets
                className="w-4 h-4 text-amber-400 shrink-0"
                aria-hidden="true"
              />
              <div>
                <div className="text-white/55 text-xs uppercase tracking-wide font-medium">
                  Humidity
                </div>
                <div className="text-white font-semibold text-sm mt-0.5">
                  {current.humidity}%
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-white/60">
              {humidityLabel(current.humidity)}
            </span>
          </div>
          <div
            className="mt-2.5 h-1.5 bg-white/10 rounded-full overflow-hidden"
            role="presentation"
          >
            <div
              className="h-full bg-amber-400/70 rounded-full transition-all duration-500 motion-reduce:transition-none"
              style={{ width: `${current.humidity}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Detail
            icon={
              <div style={{ transform: `rotate(${current.wind_deg}deg)` }}>
                <Navigation2 className="w-4 h-4" aria-hidden="true" />
              </div>
            }
            label="Wind"
            value={`${Math.round(current.wind_speed)} ${wUnit}`}
            sub={windDirection(current.wind_deg)}
          />
          <Detail
            icon={<CloudRain className="w-4 h-4" aria-hidden="true" />}
            label="Precip."
            value={`${precipPct}%`}
            sub={precipSubFinal}
          />
          <Detail
            icon={<Sunrise className="w-4 h-4" aria-hidden="true" />}
            label="Sunrise"
            value={sunriseStr}
          />
          <Detail
            icon={<Sunset className="w-4 h-4" aria-hidden="true" />}
            label="Sunset"
            value={sunsetStr}
          />
        </div>
      </div>
    </>
  );
}
