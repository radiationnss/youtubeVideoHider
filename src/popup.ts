const applyButton = document.getElementById('apply') as HTMLButtonElement;
const keywordsInput = document.getElementById('keywords') as HTMLTextAreaElement;

applyButton.addEventListener('click', async () => {
  const keywordsText = keywordsInput.value;
  const blacklist = keywordsText
    .split(',')
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 0);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: (blacklistWords: string[]) => {
      const hideMatchingVideos = () => {
        const allItems = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer');
        allItems.forEach(el => {
          const item = el as HTMLElement;
          const text = item.innerText.toLowerCase();
          if (blacklistWords.some(word => text.includes(word))) {
            item.style.display = 'none';
          }
        });
      };

      hideMatchingVideos();

      const observer = new MutationObserver(hideMatchingVideos);
      observer.observe(document.body, { childList: true, subtree: true });
    },
    args: [blacklist],
  });
});
