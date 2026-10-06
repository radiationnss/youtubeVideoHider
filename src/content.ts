(() => {
type FilterSettings = {
  keywords: string[];
  enabled: boolean;
};

const SETTINGS_KEY = "youtubeVideoHiderSettings";
const HIDDEN_ATTRIBUTE = "data-youtube-video-hider-hidden";
const CARD_SELECTOR = [
  "ytd-rich-item-renderer",
  "ytd-video-renderer",
  "ytd-grid-video-renderer",
  "ytd-compact-video-renderer",
  "ytd-playlist-video-renderer",
  "ytd-reel-item-renderer",
  "yt-lockup-view-model",
].join(",");

let settings: FilterSettings = { keywords: [], enabled: true };
let scanQueued = false;

const style = document.createElement("style");
style.textContent = `[${HIDDEN_ATTRIBUTE}="true"] { display: none !important; }`;
(document.head || document.documentElement).appendChild(style);

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function titleFor(card: Element): string {
  const title = card.querySelector<HTMLElement>(
    "#video-title, a[title], h3"
  );
  return normalize(title?.innerText || title?.getAttribute("title") || title?.textContent || "");
}

function updateCard(card: Element): void {
  const title = titleFor(card);
  const shouldHide = settings.enabled && title.length > 0 && settings.keywords.some((keyword) => title.includes(keyword));
  if (shouldHide) {
    card.setAttribute(HIDDEN_ATTRIBUTE, "true");
  } else {
    card.removeAttribute(HIDDEN_ATTRIBUTE);
  }
}

function scanCards(): void {
  scanQueued = false;
  document.querySelectorAll(CARD_SELECTOR).forEach(updateCard);
  document.documentElement.dataset.youtubeVideoHiderEnabled = String(settings.enabled);
  document.documentElement.dataset.youtubeVideoHiderHiddenCount = String(
    document.querySelectorAll(`[${HIDDEN_ATTRIBUTE}="true"]`).length
  );
}

function scheduleScan(): void {
  if (scanQueued) return;
  scanQueued = true;
  window.requestAnimationFrame(scanCards);
}

function parseSettings(value: unknown): FilterSettings {
  const raw = value && typeof value === "object" ? value as Partial<FilterSettings> : {};
  return {
    keywords: Array.isArray(raw.keywords)
      ? raw.keywords.filter((word): word is string => typeof word === "string").map(normalize).filter(Boolean)
      : [],
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : true,
  };
}

chrome.storage.sync.get(SETTINGS_KEY, (result) => {
  settings = parseSettings(result[SETTINGS_KEY]);
  scheduleScan();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !changes[SETTINGS_KEY]) return;
  settings = parseSettings(changes[SETTINGS_KEY].newValue);
  scheduleScan();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "youtube-video-hider:count") {
    sendResponse({ hiddenCount: document.querySelectorAll(`[${HIDDEN_ATTRIBUTE}="true"]`).length });
    return;
  }
  if (message?.type !== "youtube-video-hider:settings") return;
  settings = parseSettings(message.settings);
  scanCards();
});

const observer = new MutationObserver(scheduleScan);
observer.observe(document.documentElement, { childList: true, subtree: true });

// YouTube navigation often changes the current view without replacing the document.
window.addEventListener("yt-navigate-finish", scheduleScan);
})();
