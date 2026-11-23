import { describe, expect, test } from "vitest";
import { getMondayOf } from "@/lib/week";

describe("getMondayOf", () => {
  test("a Wednesday goes back to that week's Monday at midnight UTC", () => {
    expect(getMondayOf(new Date("2026-11-25T15:30:00Z")).toISOString()).toBe(
      "2026-11-23T00:00:00.000Z",
    );
  });

  test("Sunday belongs to the week that started six days earlier", () => {
    expect(getMondayOf(new Date("2026-11-29T23:59:00Z")).toISOString()).toBe(
      "2026-11-23T00:00:00.000Z",
    );
  });

  test("a week that starts in the previous month", () => {
    expect(getMondayOf(new Date("2026-11-01T12:00:00Z")).toISOString()).toBe(
      "2026-10-26T00:00:00.000Z",
    );
  });
});
