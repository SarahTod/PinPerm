document.getElementById("pinAll").addEventListener("click", async () => {
  const tabs = await browser.tabs.query({ currentWindow: true });
  for (const tab of tabs) {
    await browser.tabs.update(tab.id, { pinned: true });
  }
});

document.getElementById("unpinAll").addEventListener("click", async () => {
  const tabs = await browser.tabs.query({ currentWindow: true, pinned: true });
  for (const tab of tabs) {
    await browser.tabs.update(tab.id, { pinned: false });
  }
});
