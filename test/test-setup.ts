import "@testing-library/jest-dom/vitest";
import { fakeBrowser } from "@webext-core/fake-browser";
import { afterEach, beforeEach } from "vitest";
import { cleanupTimestampRevealer } from "../src/content-logic";

(globalThis as typeof globalThis & { chrome: typeof chrome }).chrome =
  fakeBrowser as unknown as typeof chrome;

beforeEach(() => {
  fakeBrowser.reset();
});

afterEach(() => {
  cleanupTimestampRevealer();
  fakeBrowser.reset();
  document.body.innerHTML = "";
});
