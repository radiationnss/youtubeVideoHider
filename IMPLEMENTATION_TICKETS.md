# YouTube Video Hider implementation tickets

## T1 — Persist and centralize filter settings — Complete

- [x] Save keywords and enabled state in `chrome.storage.sync`.
- [x] Remove the hard-coded example blacklist and duplicate injected filtering implementation.
- [x] Apply saved settings on page load and immediately after popup changes.

## T2 — Make filtering work with YouTube navigation and dynamic results — Complete

- [x] Observe added cards and YouTube's client-side navigation.
- [x] Cover common home, search, grid, compact, playlist, Shorts, and lockup cards.
- [x] Match titles case-insensitively and hide/unhide cards without duplicate overlays.
- [x] Report the number of currently hidden cards to the popup.

## T3 — Complete popup controls and feedback — Complete

- [x] Load saved settings when the popup opens.
- [x] Add enabled/paused control, apply, and clear actions.
- [x] Show save/apply errors, reload guidance, and hidden-card count.

## T4 — Document setup and verify packaging — Complete

- [x] Document development, build, installation, and current matching behavior.
- [x] Build TypeScript output and check manifest references.
