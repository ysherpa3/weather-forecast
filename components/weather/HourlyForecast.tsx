"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import type { OnecallHourly, Units } from "@/types/weather";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { tempUnit } from "@/lib/utils";

interface Props {
  hourly: OnecallHourly[];
  timezone: number;
  units: Units;
}

function HourlySlot({
  item,
  timezone,
  tUnit,
}: {
  item: OnecallHourly;
  timezone: number;
  tUnit: string;
}) {
  const localTime = new Date((item.dt + timezone) * 1000);
  const timeStr = localTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: "UTC",
  });
  const pop = Math.round(item.pop * 100);
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0 w-18 sm:w-20 px-3 py-3 rounded-xl bg-white/5 border border-white/8">
      <span className="text-white/60 text-xs font-medium">{timeStr}</span>
      <Image
        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
        alt={item.weather[0].description}
        width={40}
        height={40}
        className="opacity-90"
        unoptimized
      />
      <span className="text-white font-semibold text-sm tabular-nums">
        {Math.round(item.temp)}
        {tUnit}
      </span>
      {pop > 0 && (
        <span className="text-blue-300 text-xs tabular-nums">{pop}%</span>
      )}
    </div>
  );
}

export default function HourlyForecast({ hourly, timezone, units }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tUnit = tempUnit(units);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [expanded, updateScrollState]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="border-t border-white/8">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 sm:px-6 text-sm font-medium text-white/65 hover:text-white/90 hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-white/40"
        aria-expanded={expanded}
        aria-controls="forecast-hourly"
      >
        <span>Hourly forecast</span>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200 motion-reduce:transition-none"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div
          id="forecast-hourly"
          role="region"
          aria-label="Hourly forecast"
          className="px-4 pb-4 sm:px-6 sm:pb-5"
        >
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 items-center justify-center w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 text-white/80 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div
              ref={scrollRef}
              className="flex gap-2.5 overflow-x-auto scrollbar-none py-3"
            >
              {hourly.map((item) => (
                <HourlySlot
                  key={item.dt}
                  item={item}
                  timezone={timezone}
                  tUnit={tUnit}
                />
              ))}
            </div>
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 items-center justify-center w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 text-white/80 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
