import { test } from "node:test";
import assert from "node:assert/strict";
import { temp, wind } from "./utils.ts";

test("metric rounds without converting", () => {
  assert.equal(temp(20.6, "metric"), 21);
  assert.equal(wind(5.8, "metric"), 6);
});

test("imperial converts then rounds", () => {
  assert.equal(temp(0, "imperial"), 32);
  assert.equal(temp(100, "imperial"), 212);
  assert.equal(wind(10, "imperial"), 22);
});

test("rounding after converting, not before", () => {
  // 10.4C is 50.72F, which rounds to 51. Rounding to 10C first would give 50.
  assert.equal(temp(10.4, "imperial"), 51);
});

test("negative temperatures convert correctly", () => {
  assert.equal(temp(-40, "imperial"), -40);
  assert.equal(temp(-17.8, "imperial"), 0);
});
