import { screen, waitFor } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import {
  ABSOLUTE_TIMESTAMP_CLASS,
  cleanupObserver,
  getAbsoluteTimestampText,
  revealTimestamps,
  setupObserver,
} from "../src/content-logic";

const formatDateTime = (date: Date) => date.toISOString();

const absoluteText = (value: string) => `(${value})`;

describe("timestamp revealer", () => {
  it("adds an absolute timestamp next to GitHub relative-time elements", () => {
    document.body.innerHTML = `
      <relative-time datetime="2026-06-28T01:30:00Z" title="Jun 28, 2026, 10:30 AM GMT+9">2 hours ago</relative-time>
    `;

    expect(revealTimestamps()).toBe(1);

    const absoluteTimestamp = screen.getByText(
      absoluteText("Jun 28, 2026, 10:30 AM GMT+9"),
    );
    expect(absoluteTimestamp).toHaveClass(ABSOLUTE_TIMESTAMP_CLASS);
    expect(absoluteTimestamp).toHaveAttribute("aria-hidden", "true");
  });

  it("formats datetime attributes when a title is not available", () => {
    document.body.innerHTML = `
      <time-ago datetime="2026-06-28T01:30:00Z">2 hours ago</time-ago>
    `;

    revealTimestamps({ formatDateTime });

    expect(
      screen.getByText(absoluteText("2026-06-28T01:30:00.000Z")),
    ).toBeInTheDocument();
  });

  it("updates an existing absolute timestamp instead of duplicating it", () => {
    document.body.innerHTML = `
      <relative-time datetime="2026-06-28T01:30:00Z" title="Jun 28, 2026, 10:30 AM GMT+9">2 hours ago</relative-time>
    `;

    revealTimestamps();
    const relativeTime = document.querySelector("relative-time");
    relativeTime?.setAttribute("title", "Jun 28, 2026, 11:30 AM GMT+9");

    expect(revealTimestamps()).toBe(0);

    const absoluteTimestamps = document.querySelectorAll(
      `.${ABSOLUTE_TIMESTAMP_CLASS}`,
    );
    expect(absoluteTimestamps).toHaveLength(1);
    expect(absoluteTimestamps[0]).toHaveTextContent(
      absoluteText("Jun 28, 2026, 11:30 AM GMT+9"),
    );
  });

  it("replaces relative text with absolute text in replace mode", () => {
    document.body.innerHTML = `
      <relative-time datetime="2026-06-28T01:30:00Z" title="Jun 28, 2026, 10:30 AM GMT+9">2 hours ago</relative-time>
    `;

    revealTimestamps({ displayMode: "replace" });

    const relativeTime = document.querySelector("relative-time");
    expect(relativeTime).toHaveTextContent("Jun 28, 2026, 10:30 AM GMT+9");
    expect(
      document.querySelector(`.${ABSOLUTE_TIMESTAMP_CLASS}`),
    ).not.toBeInTheDocument();
  });

  it("restores original relative text when switching from replace to append", () => {
    document.body.innerHTML = `
      <relative-time datetime="2026-06-28T01:30:00Z" title="Jun 28, 2026, 10:30 AM GMT+9">2 hours ago</relative-time>
    `;

    revealTimestamps({ displayMode: "replace" });
    revealTimestamps({ displayMode: "append" });

    const relativeTime = document.querySelector("relative-time");
    expect(relativeTime).toHaveTextContent("2 hours ago");
    expect(
      screen.getByText(absoluteText("Jun 28, 2026, 10:30 AM GMT+9")),
    ).toBeInTheDocument();
  });

  it("decorates GitHub activity page title-based timestamps", () => {
    document.body.innerHTML = `
      <span data-testid="push-date"><span title="Jun 28, 2026, 01:30 UTC">2 hours ago</span></span>
    `;

    revealTimestamps();

    expect(
      screen.getByText(absoluteText("Jun 28, 2026, 01:30 UTC")),
    ).toBeInTheDocument();
  });

  it("ignores activity page spans with non-date titles", () => {
    document.body.innerHTML = `
      <span data-testid="push-date"><span title="not a timestamp">2 hours ago</span></span>
    `;

    expect(revealTimestamps()).toBe(0);
    expect(
      document.querySelector(`.${ABSOLUTE_TIMESTAMP_CLASS}`),
    ).not.toBeInTheDocument();
  });

  it("returns null for elements without timestamp data", () => {
    const element = document.createElement("span");

    expect(getAbsoluteTimestampText(element)).toBeNull();
  });

  it("observes newly added timestamp elements", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    setupObserver();

    document
      .getElementById("root")
      ?.insertAdjacentHTML(
        "beforeend",
        `<relative-time datetime="2026-06-28T01:30:00Z" title="Jun 28, 2026, 10:30 AM GMT+9">2 hours ago</relative-time>`,
      );

    await waitFor(() => {
      expect(
        screen.getByText(absoluteText("Jun 28, 2026, 10:30 AM GMT+9")),
      ).toBeInTheDocument();
    });
  });

  it("disconnects the active observer on cleanup", () => {
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, "disconnect");

    setupObserver();
    cleanupObserver();

    expect(disconnectSpy).toHaveBeenCalled();
    disconnectSpy.mockRestore();
  });
});
