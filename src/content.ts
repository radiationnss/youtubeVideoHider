const blacklist = ["MrBeast", "Fortnite", "Shorts"]; // Example keywords

function hideVideos() {
  const videoItems = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');

  videoItems.forEach((item:any) => {
    const titleElement = item.querySelector('#video-title') as HTMLElement;
    if (!titleElement) return;

    const title = titleElement.innerText.toLowerCase();
    const matches = blacklist.some(keyword => title.includes(keyword.toLowerCase()));
    
    if (matches) {
      item.setAttribute('data-hidden-by-extension', 'true');

      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8);
        color: white;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
      `;
      overlay.textContent = "Hidden by YouTube Video Hider";

      item.style.position = "relative";
      item.appendChild(overlay);
    }
  });
}

// Run on page load and on dynamic changes (YouTube is SPA)
new MutationObserver(hideVideos).observe(document.body, {
  childList: true,
  subtree: true
});

hideVideos();
