export const DISPLAY_MODE_STORAGE_KEY = "timestampDisplayMode";
export const DEFAULT_DISPLAY_MODE = "append";

export type TimestampDisplayMode = "append" | "replace";

interface StoredSettings {
  [DISPLAY_MODE_STORAGE_KEY]: TimestampDisplayMode;
}

export interface TimestampRevealerSettings {
  displayMode: TimestampDisplayMode;
}

export const isTimestampDisplayMode = (
  value: unknown,
): value is TimestampDisplayMode => value === "append" || value === "replace";

export const normalizeDisplayMode = (value: unknown): TimestampDisplayMode =>
  isTimestampDisplayMode(value) ? value : DEFAULT_DISPLAY_MODE;

export const getTimestampRevealerSettings =
  async (): Promise<TimestampRevealerSettings> => {
    if (typeof chrome === "undefined" || !chrome.storage?.sync) {
      return { displayMode: DEFAULT_DISPLAY_MODE };
    }

    const settings = await chrome.storage.sync.get<StoredSettings>({
      [DISPLAY_MODE_STORAGE_KEY]: DEFAULT_DISPLAY_MODE,
    });

    return {
      displayMode: normalizeDisplayMode(settings[DISPLAY_MODE_STORAGE_KEY]),
    };
  };

export const saveTimestampDisplayMode = async (
  displayMode: TimestampDisplayMode,
) => {
  await chrome.storage.sync.set<StoredSettings>({
    [DISPLAY_MODE_STORAGE_KEY]: displayMode,
  });
};

export const onTimestampDisplayModeChanged = (
  listener: (displayMode: TimestampDisplayMode) => void,
) => {
  if (typeof chrome === "undefined" || !chrome.storage?.onChanged) {
    return () => {};
  }

  const handleChange = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ) => {
    if (areaName !== "sync") return;

    const displayModeChange = changes[DISPLAY_MODE_STORAGE_KEY];
    if (!displayModeChange) return;

    listener(normalizeDisplayMode(displayModeChange.newValue));
  };

  chrome.storage.onChanged.addListener(handleChange);

  return () => {
    chrome.storage.onChanged.removeListener(handleChange);
  };
};
