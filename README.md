# YouTube Video Hider

A Chrome Manifest V3 extension that hides YouTube video cards when their titles contain any configured keyword or phrase.

## Build

```sh
npm install
npm run build
```

The TypeScript build writes `lib/content.js` and `lib/popup.js`, which are referenced by the extension manifest and popup.

## Install locally

1. Run the build above.
2. Open `chrome://extensions` in Chrome and enable **Developer mode**.
3. Choose **Load unpacked** and select this project directory.
4. Open YouTube, open the extension popup, enter comma-separated keywords or phrases, and choose **Save and apply**.

Settings sync through Chrome storage. **Clear** removes all keywords; uncheck the enabled option to pause filtering while preserving them. Changes apply to the active YouTube tab. If the content script is unavailable in a tab that was already open, reload that tab.

Matching is case-insensitive substring matching against card titles. Common home, search, grid, compact, playlist, Shorts, and lockup card renderers are covered. YouTube changes its page markup over time, so newly introduced card layouts may need to be added to the content script selectors.
