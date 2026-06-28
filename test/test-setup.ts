import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanupTimestampRevealer } from "../src/content-logic";

afterEach(() => {
  cleanupTimestampRevealer();
  document.body.innerHTML = "";
});
