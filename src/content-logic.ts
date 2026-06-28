import {
  DEFAULT_DISPLAY_MODE,
  getTimestampRevealerSettings,
  onTimestampDisplayModeChanged,
  type TimestampDisplayMode,
} from "./settings";

export const ABSOLUTE_TIMESTAMP_CLASS = "github-timestamp-revealer-absolute";

const DECORATED_ATTRIBUTE = "data-github-timestamp-revealer-decorated";
const ORIGINAL_TEXT_ATTRIBUTE = "data-github-timestamp-revealer-original-text";
const TARGET_SELECTOR = [
  "relative-time",
  "time-ago",
  "local-time",
  "time[datetime]",
  'span[data-testid="push-date"] span[title]',
].join(", ");

type FormatDateTime = (date: Date) => string;

export interface RevealTimestampsOptions {
  root?: ParentNode;
  formatDateTime?: FormatDateTime;
  displayMode?: TimestampDisplayMode;
}

let observer: MutationObserver | null = null;
let revealTimer: number | null = null;
let removeNavigationListeners: (() => void) | null = null;
let removeSettingsChangeListener: (() => void) | null = null;
let currentDisplayMode: TimestampDisplayMode = DEFAULT_DISPLAY_MODE;

export const formatAbsoluteDateTime: FormatDateTime = (date) =>
  new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);

const isElement = (node: Node): node is Element => node instanceof Element;

const isTimestampTarget = (node: Node): node is Element =>
  isElement(node) && node.matches(TARGET_SELECTOR);

const isGitHubTimeElement = (element: Element) => {
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === "relative-time" ||
    tagName === "time-ago" ||
    tagName === "local-time"
  );
};

const isLikelyDateString = (value: string) =>
  Number.isFinite(Date.parse(value));

const parseDate = (value: string) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
};

const getDatetimeAttribute = (element: Element) => {
  const datetime = element.getAttribute("datetime")?.trim();
  if (datetime) return datetime;

  if (element instanceof HTMLTimeElement && element.dateTime.trim()) {
    return element.dateTime.trim();
  }

  return null;
};

export const getAbsoluteTimestampText = (
  element: Element,
  formatDateTime: FormatDateTime = formatAbsoluteDateTime,
) => {
  const title = element.getAttribute("title")?.trim();

  if (title && isGitHubTimeElement(element)) {
    return title;
  }

  if (title && element.matches('span[data-testid="push-date"] span[title]')) {
    return isLikelyDateString(title) ? title : null;
  }

  if (
    title &&
    element instanceof HTMLTimeElement &&
    isLikelyDateString(title)
  ) {
    return title;
  }

  const datetime = getDatetimeAttribute(element);
  if (!datetime) return null;

  const date = parseDate(datetime);
  return date ? formatDateTime(date) : null;
};

const findExistingAbsoluteTimestamp = (element: Element) => {
  const next = element.nextElementSibling;
  return next?.classList.contains(ABSOLUTE_TIMESTAMP_CLASS) ? next : null;
};

const renderAbsoluteTimestamp = (text: string) => `(${text})`;

const storeOriginalTimestampText = (element: Element) => {
  if (element.hasAttribute(ORIGINAL_TEXT_ATTRIBUTE)) return;

  element.setAttribute(ORIGINAL_TEXT_ATTRIBUTE, element.textContent ?? "");
};

const restoreOriginalTimestampText = (element: Element) => {
  const originalText = element.getAttribute(ORIGINAL_TEXT_ATTRIBUTE);
  if (originalText === null) return;

  if (element.textContent !== originalText) {
    element.textContent = originalText;
  }
};

export const revealTimestampElement = (
  element: Element,
  formatDateTime: FormatDateTime = formatAbsoluteDateTime,
  displayMode: TimestampDisplayMode = currentDisplayMode,
) => {
  if (element.classList.contains(ABSOLUTE_TIMESTAMP_CLASS)) {
    return false;
  }

  const timestampText = getAbsoluteTimestampText(element, formatDateTime);
  const existing = findExistingAbsoluteTimestamp(element);

  if (!timestampText) {
    existing?.remove();
    restoreOriginalTimestampText(element);
    element.removeAttribute(DECORATED_ATTRIBUTE);
    return false;
  }

  element.setAttribute(DECORATED_ATTRIBUTE, "true");

  if (displayMode === "replace") {
    const didHaveExistingAppend = existing !== null;
    existing?.remove();
    storeOriginalTimestampText(element);

    if (element.textContent !== timestampText) {
      element.textContent = timestampText;
      return true;
    }

    return didHaveExistingAppend;
  }

  restoreOriginalTimestampText(element);

  const renderedText = renderAbsoluteTimestamp(timestampText);

  if (existing) {
    if (existing.textContent !== renderedText) {
      existing.textContent = renderedText;
    }
    return false;
  }

  const absoluteTimestamp = document.createElement("span");
  absoluteTimestamp.className = ABSOLUTE_TIMESTAMP_CLASS;
  absoluteTimestamp.textContent = renderedText;
  absoluteTimestamp.setAttribute("aria-hidden", "true");
  element.insertAdjacentElement("afterend", absoluteTimestamp);
  return true;
};

const getTimestampTargets = (root: ParentNode) => {
  const targets = Array.from(root.querySelectorAll(TARGET_SELECTOR));

  if (root instanceof Element && root.matches(TARGET_SELECTOR)) {
    targets.unshift(root);
  }

  return targets;
};

export const revealTimestamps = (options: RevealTimestampsOptions = {}) => {
  const root = options.root ?? document;
  const displayMode = options.displayMode ?? currentDisplayMode;
  let revealedCount = 0;

  for (const element of getTimestampTargets(root)) {
    if (revealTimestampElement(element, options.formatDateTime, displayMode)) {
      revealedCount += 1;
    }
  }

  return revealedCount;
};

const nodeMayContainTimestamp = (node: Node) =>
  isTimestampTarget(node) ||
  (isElement(node) && node.querySelector(TARGET_SELECTOR) !== null);

const scheduleReveal = () => {
  if (revealTimer !== null) return;

  revealTimer = window.setTimeout(() => {
    revealTimer = null;
    revealTimestamps();
  }, 0);
};

export const cleanupObserver = () => {
  if (revealTimer !== null) {
    window.clearTimeout(revealTimer);
    revealTimer = null;
  }

  observer?.disconnect();
  observer = null;
};

export const setupObserver = () => {
  if (!document.body) {
    window.setTimeout(setupObserver, 100);
    return;
  }

  cleanupObserver();

  observer = new MutationObserver((mutations) => {
    const shouldReveal = mutations.some((mutation) => {
      if (
        mutation.type === "attributes" &&
        isTimestampTarget(mutation.target)
      ) {
        return true;
      }

      if (
        mutation.type === "characterData" &&
        mutation.target.parentElement &&
        isTimestampTarget(mutation.target.parentElement)
      ) {
        return true;
      }

      return Array.from(mutation.addedNodes).some(nodeMayContainTimestamp);
    });

    if (shouldReveal) {
      scheduleReveal();
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["datetime", "title"],
    characterData: true,
    childList: true,
    subtree: true,
  });
};

export const initializeTimestampRevealer = () => {
  if (removeNavigationListeners) return;

  revealTimestamps();
  setupObserver();

  void getTimestampRevealerSettings().then(({ displayMode }) => {
    currentDisplayMode = displayMode;
    revealTimestamps();
  });

  removeSettingsChangeListener = onTimestampDisplayModeChanged(
    (displayMode) => {
      currentDisplayMode = displayMode;
      revealTimestamps();
    },
  );

  const handleNavigation = () => {
    revealTimestamps();
    setupObserver();
  };

  document.addEventListener("pjax:end", handleNavigation);
  document.addEventListener("turbo:load", handleNavigation);
  document.addEventListener("turbo:render", handleNavigation);
  window.addEventListener("popstate", handleNavigation);

  const handleBeforeUnload = () => {
    cleanupObserver();
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  removeNavigationListeners = () => {
    document.removeEventListener("pjax:end", handleNavigation);
    document.removeEventListener("turbo:load", handleNavigation);
    document.removeEventListener("turbo:render", handleNavigation);
    window.removeEventListener("popstate", handleNavigation);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
};

export const cleanupTimestampRevealer = () => {
  cleanupObserver();
  removeNavigationListeners?.();
  removeSettingsChangeListener?.();
  removeNavigationListeners = null;
  removeSettingsChangeListener = null;
  currentDisplayMode = DEFAULT_DISPLAY_MODE;
};
