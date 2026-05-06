"use client";

import { useState } from "react";
import Image from "next/image";
import type { DailyItem, Units } from "@/types/weather";
import { ChevronDown, Droplet } from "lucide-react";
import { tempUnit } from "@/lib/utils";

interface Props {
  days: DailyItem[];
  units: Units;
}

function DailyRow({ day, tUnit }: { day: DailyItem; tUnit: string }) {
  const pop = Math.round(day.popMax * 100);
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/6 last:border-0">
      <span className="text-white/80 text-sm w-20 sm:w-24 shrink-0">
        {day.dateLabel}
      </span>
      <Image
        src={`https://openweathermap.org/img/wn/${day.weather.icon}.png`}
        alt={day.weather.description}
        width={36}
        height={36}
        className="opacity-90 shrink-0 -my-1"
        unoptimized
      />
      <span className="text-white/55 text-xs flex-1 truncate capitalize">
        {day.weather.description}
      </span>
      <div className="flex items-center justify-end gap-1 w-10 shrink-0">
        {pop > 10 && (
          <>
            <Droplet
              className="w-3 h-3 text-blue-300/70 shrink-0"
              aria-hidden="true"
            />
            <span
              className="text-blue-300 text-xs tabular-nums"
              aria-label={`${pop}% precipitation chance`}
            >
              {pop}%
            </span>
          </>
        )}
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0 w-14">
        <span className="text-white text-sm font-semibold tabular-nums">
          {day.tempMax}
          {tUnit}
        </span>
        <span className="text-white/60 text-xs tabular-nums">
          {day.tempMin}
          {tUnit}
        </span>
      </div>
    </div>
  );
}

export default function DailyForecast({ days, units }: Props) {
  const [expanded, setExpanded] = useState(false);
  const tUnit = tempUnit(units);

  return (
    <div className="border-t border-white/8">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 sm:px-6 text-sm font-medium text-white/65 hover:text-white/90 hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-white/40"
        aria-expanded={expanded}
        aria-controls="forecast-daily"
      >
        <span>7-day forecast</span>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200 motion-reduce:transition-none"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        />
      </button>
      {expanded && (
        <div
          id="forecast-daily"
          role="region"
          aria-label="7-day forecast"
          className="px-4 pt-3 pb-4 sm:px-6 sm:pt-4 sm:pb-5"
        >
          {days.map((day, i) => (
            <DailyRow key={i} day={day} tUnit={tUnit} />
          ))}
        </div>
      )}
    </div>
  );
}
