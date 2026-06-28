import { describe, expect, it } from "vitest";
import {
  DEFAULT_DISPLAY_MODE,
  DISPLAY_MODE_STORAGE_KEY,
  getTimestampRevealerSettings,
  normalizeDisplayMode,
  saveTimestampDisplayMode,
} from "../src/settings";

describe("settings", () => {
  it("normalizes unknown display mode values to the default", () => {
    expect(normalizeDisplayMode("replace")).toBe("replace");
    expect(normalizeDisplayMode("unknown")).toBe(DEFAULT_DISPLAY_MODE);
  });

  it("saves and reads the timestamp display mode", async () => {
    await saveTimestampDisplayMode("replace");

    await expect(
      chrome.storage.sync.get(DISPLAY_MODE_STORAGE_KEY),
    ).resolves.toEqual({
      [DISPLAY_MODE_STORAGE_KEY]: "replace",
    });
    await expect(getTimestampRevealerSettings()).resolves.toEqual({
      displayMode: "replace",
    });
  });
});
