import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { describe, expect, it } from "vitest";

const loadOptionsPage = async () => {
  document.body.innerHTML = `
    <main>
      <label>
        <input type="radio" name="timestamp-display-mode" value="append" />
        <span>Append</span>
      </label>
      <label>
        <input type="radio" name="timestamp-display-mode" value="replace" />
        <span>Replace</span>
      </label>
    </main>
  `;

  await import("../src/options");
};

describe("options page", () => {
  it("loads the saved display mode and persists changes", async () => {
    await chrome.storage.sync.set({ timestampDisplayMode: "replace" });

    await loadOptionsPage();

    const replaceInput = screen.getByRole("radio", {
      name: /replace/i,
    }) as HTMLInputElement;
    const appendInput = screen.getByRole("radio", {
      name: /append/i,
    }) as HTMLInputElement;

    await waitFor(() => {
      expect(replaceInput).toBeChecked();
    });

    fireEvent.click(appendInput);

    await waitFor(async () => {
      await expect(
        chrome.storage.sync.get("timestampDisplayMode"),
      ).resolves.toEqual({
        timestampDisplayMode: "append",
      });
    });
  });
});
