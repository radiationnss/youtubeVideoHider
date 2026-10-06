(() => {
type FilterSettings = { keywords: string[]; enabled: boolean };

const SETTINGS_KEY = "youtubeVideoHiderSettings";
const keywordsInput = document.getElementById("keywords") as HTMLTextAreaElement;
const enabledInput = document.getElementById("enabled") as HTMLInputElement;
const status = document.getElementById("status") as HTMLParagraphElement;
const applyButton = document.getElementById("apply") as HTMLButtonElement;
const clearButton = document.getElementById("clear") as HTMLButtonElement;

function parseKeywords(text: string): string[] {
  return [...new Set(text.split(",").map((word) => word.normalize("NFKC").trim()).filter(Boolean))];
}

function showStatus(message: string, isError = false): void {
  status.textContent = message;
  status.dataset.error = String(isError);
}

function readSettings(): Promise<FilterSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(SETTINGS_KEY, (result) => {
      const value = result[SETTINGS_KEY] as Partial<FilterSettings> | undefined;
      resolve({
        keywords: Array.isArray(value?.keywords) ? value.keywords : [],
        enabled: typeof value?.enabled === "boolean" ? value.enabled : true,
      });
    });
  });
}

async function applySettings(): Promise<void> {
  const settings: FilterSettings = {
    keywords: parseKeywords(keywordsInput.value),
    enabled: enabledInput.checked,
  };

  try {
    await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url?.startsWith("https://www.youtube.com/")) {
      showStatus("Saved. Open YouTube to filter videos.");
      return;
    }

    try {
      await chrome.tabs.sendMessage(tab.id, { type: "youtube-video-hider:settings", settings });
    } catch {
      // A page opened before the extension was installed may not have the content script yet.
      showStatus("Saved. Reload the YouTube tab to apply these settings.");
      return;
    }
    if (!settings.enabled) {
      showStatus("Saved · filtering paused");
      return;
    }
    const result = await chrome.tabs.sendMessage(tab.id, { type: "youtube-video-hider:count" });
    showStatus(`Saved · ${result.hiddenCount ?? 0} video(s) hidden`);
  } catch {
    showStatus("Could not save settings. Try again.", true);
  }
}

applyButton.addEventListener("click", () => void applySettings());
clearButton.addEventListener("click", () => {
  keywordsInput.value = "";
  void applySettings();
});

void readSettings().then((settings) => {
  keywordsInput.value = settings.keywords.join(", ");
  enabledInput.checked = settings.enabled;
  void chrome.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
    if (!tab?.id || !tab.url?.startsWith("https://www.youtube.com/")) return;
    try {
      const result = await chrome.tabs.sendMessage(tab.id, { type: "youtube-video-hider:count" });
      showStatus(`${result.hiddenCount ?? 0} video(s) hidden`);
    } catch {
      showStatus("Reload YouTube to start filtering.");
    }
  });
});
})();
