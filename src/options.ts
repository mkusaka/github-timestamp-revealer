import "./options.css";
import {
  getTimestampRevealerSettings,
  isTimestampDisplayMode,
  saveTimestampDisplayMode,
  type TimestampDisplayMode,
} from "./settings";

const selector = 'input[name="timestamp-display-mode"]';

const getDisplayModeInputs = () =>
  Array.from(
    document.querySelectorAll<HTMLInputElement>(selector),
  ) as HTMLInputElement[];

const setCheckedDisplayMode = (displayMode: TimestampDisplayMode) => {
  for (const input of getDisplayModeInputs()) {
    input.checked = input.value === displayMode;
  }
};

const init = async () => {
  const { displayMode } = await getTimestampRevealerSettings();
  setCheckedDisplayMode(displayMode);

  for (const input of getDisplayModeInputs()) {
    input.addEventListener("change", async () => {
      if (!input.checked || !isTimestampDisplayMode(input.value)) return;

      await saveTimestampDisplayMode(input.value);
    });
  }
};

void init();
