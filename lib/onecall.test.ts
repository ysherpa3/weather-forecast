import { test } from "node:test";
import assert from "node:assert/strict";
import {
  transformOnecall,
  type OWM4Current,
  type OWM4Hour,
  type OWM4Day,
} from "./onecall.ts";

const clouds = {
  id: 803,
  main: "Clouds",
  description: "broken clouds",
  icon: "04d",
};

function current(over: Partial<OWM4Current> = {}): OWM4Current {
  return {
    dt: 1788274800,
    sunrise: 1788239579,
    sunset: 1788288518,
    temp: 22.75,
    feels_like: 22.26,
    pressure: 1019,
    humidity: 45,
    uvi: 2.31,
    clouds: 70,
    visibility: 10000,
    wind_speed: 5.8,
    wind_deg: 244,
    weather: [clouds],
    ...over,
  };
}

function hours(...slots: Array<{ pop: number; id?: number }>): OWM4Hour[] {
  return slots.map((s, i) => ({
    dt: 1788274800 + i * 3600,
    temp: 22.75,
    feels_like: 22.26,
    humidity: 45,
    wind_speed: 5.8,
    wind_deg: 244,
    pop: s.pop,
    weather: [{ ...clouds, id: s.id ?? clouds.id }],
  }));
}

function days(count: number): OWM4Day[] {
  return Array.from({ length: count }, (_, i) => ({
    dt: 1788274800 + i * 86400,
    // 4.0 daily temp carries day/night/eve/morn alongside min/max
    temp: { day: 18 + i, min: 10.4 + i, max: 20.6 + i },
    pop: i / 10,
    weather: [clouds],
  }));
}

const flat = (...pops: number[]) => hours(...pops.map((pop) => ({ pop })));

test("today comes from data[0] of the daily timeline, unrounded", () => {
  const out = transformOnecall(current(), flat(0), days(8), 0);
  assert.deepEqual(out.today, { tempMin: 10.4, tempMax: 20.6 });
});

test("days skips today and caps at 7", () => {
  const out = transformOnecall(current(), flat(0), days(10), 0);
  assert.equal(out.days.length, 7);
  assert.equal(out.days[0].tempMin, 11.4); // data[1], not data[0]
});

test("hourly is capped at 12 of the 20 the endpoint can return", () => {
  const out = transformOnecall(
    current(),
    flat(...Array(20).fill(0)),
    days(8),
    0,
  );
  assert.equal(out.hourly.length, 12);
});

test("precip uses the real pop of the next hour, not the condition code", () => {
  const out = transformOnecall(
    current(),
    hours({ pop: 0.42, id: 500 }),
    days(8),
    0,
  );
  assert.deepEqual(out.precip, { pct: 42, type: "Rain" });
});

test("clear-sky hour reports 0%, not a fabricated cloud-cover guess", () => {
  const out = transformOnecall(
    current(),
    hours({ pop: 0, id: 803 }),
    days(8),
    0,
  );
  assert.deepEqual(out.precip, { pct: 0, type: "Unlikely" });
});

test("a failed forecast endpoint degrades instead of throwing", () => {
  // The route passes [] when the hourly or daily call fails; current conditions still render.
  const out = transformOnecall(current(), [], [], 0);
  assert.equal(out.today, null);
  assert.equal(out.precip, null);
  assert.deepEqual(out.days, []);
  assert.deepEqual(out.hourly, []);
  assert.equal(out.current.temp, 22.75);
});

test("polar current conditions without sunrise/sunset pass through", () => {
  const out = transformOnecall(
    current({ sunrise: undefined, sunset: undefined }),
    flat(0),
    days(8),
    0,
  );
  assert.equal(out.current.sunrise, undefined);
  assert.equal(out.current.sunset, undefined);
});

test("dateLabel is shifted by timezone_offset", () => {
  // dt 1788307200 = Wed 2026-09-02 00:00 UTC; a -1h offset puts it on Tue the 1st
  const two: OWM4Day[] = [
    { dt: 0, temp: { day: 0, min: 0, max: 0 }, pop: 0, weather: [clouds] },
    {
      dt: 1788307200,
      temp: { day: 8, min: 5, max: 10 },
      pop: 0,
      weather: [clouds],
    },
  ];
  assert.equal(
    transformOnecall(current(), flat(0), two, 0).days[0].dateLabel,
    "Wed, Sep 2",
  );
  assert.equal(
    transformOnecall(current(), flat(0), two, -3600).days[0].dateLabel,
    "Tue, Sep 1",
  );
});
