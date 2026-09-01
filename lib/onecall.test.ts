import { test } from "node:test";
import assert from "node:assert/strict";
import { transformOnecall, type OWMOneCallResponse } from "./onecall.ts";

const clouds = {
  id: 803,
  main: "Clouds",
  description: "broken clouds",
  icon: "04d",
};

type Hourly = NonNullable<OWMOneCallResponse["hourly"]>;

function hours(...slots: Array<{ pop: number; id?: number }>): Hourly {
  return slots.map((s, i) => ({
    dt: 1788274800 + i * 3600,
    pop: s.pop,
    weather: [{ ...clouds, id: s.id ?? clouds.id }],
  })) as unknown as Hourly;
}

function days(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    dt: 1788274800 + i * 86400,
    temp: { min: 10.4 + i, max: 20.6 + i },
    weather: [clouds],
    pop: i / 10,
  }));
}

function payload(over: Partial<OWMOneCallResponse> = {}): OWMOneCallResponse {
  return {
    timezone_offset: 0,
    current: { temp: 20 },
    hourly: hours(...Array.from({ length: 48 }, () => ({ pop: 0 }))),
    daily: days(8),
    ...over,
  };
}

test("today comes from daily[0], rounded", () => {
  assert.deepEqual(transformOnecall(payload()).today, {
    tempMin: 10,
    tempMax: 21,
  });
});

test("days skips today and caps at 7", () => {
  const out = transformOnecall(payload());
  assert.equal(out.days.length, 7);
  assert.equal(out.days[0].tempMin, 11); // daily[1], not daily[0]
});

test("hourly is capped at 12 slots", () => {
  assert.equal(transformOnecall(payload()).hourly.length, 12);
});

test("precip uses the real pop of the next hour, not the condition code", () => {
  const out = transformOnecall(payload({ hourly: hours({ pop: 0.42, id: 500 }) }));
  assert.deepEqual(out.precip, { pct: 42, type: "Rain" });
});

test("clear-sky hour reports 0%, not a fabricated cloud-cover guess", () => {
  const out = transformOnecall(payload({ hourly: hours({ pop: 0, id: 803 }) }));
  assert.deepEqual(out.precip, { pct: 0, type: "Unlikely" });
});

test("missing daily and hourly yield nulls instead of throwing", () => {
  const out = transformOnecall(
    payload({ daily: undefined, hourly: undefined }),
  );
  assert.equal(out.today, null);
  assert.equal(out.precip, null);
  assert.deepEqual(out.days, []);
  assert.deepEqual(out.hourly, []);
});

test("dateLabel is shifted by timezone_offset", () => {
  // dt 1788307200 = Wed 2026-09-02 00:00 UTC; a -1h offset puts it on Tue the 1st
  const daily = [
    { dt: 0, temp: { min: 0, max: 0 }, weather: [clouds], pop: 0 },
    { dt: 1788307200, temp: { min: 5, max: 10 }, weather: [clouds], pop: 0 },
  ];
  assert.equal(
    transformOnecall(payload({ daily, timezone_offset: 0 })).days[0].dateLabel,
    "Wed, Sep 2",
  );
  assert.equal(
    transformOnecall(payload({ daily, timezone_offset: -3600 })).days[0]
      .dateLabel,
    "Tue, Sep 1",
  );
});
