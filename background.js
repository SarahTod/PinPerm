let pinnedTabs = [];

// Let's play "Is this URL legit or what?"
function isValidUrl(url) {
  try {
    new URL(url);
    return url.startsWith("http://") || url.startsWith("https://");
  } catch (e) {
    // Nice try, sneaky URL!
    return false;
  }
}

// Time to wake up our sleepy pinned tabs
async function loadSavedPinnedTabs() {
  const storage = await browser.storage.local.get("pinnedTabs");
  pinnedTabs = (storage.pinnedTabs || []).filter(isValidUrl);
  console.log("Rise and shine, pinned tabs:", pinnedTabs);
}

// The Great Tab Restoration of 2024
async function restorePinnedTabs() {
  await loadSavedPinnedTabs();

  // Let's see what tabs are already living it up in pinned-land
  const existingTabs = await browser.tabs.query({});
  const existingPinnedUrls = existingTabs
    .filter((tab) => tab.pinned)
    .map((tab) => tab.url);
  console.log("VIP tabs already in the club:", existingPinnedUrls);

  for (const url of pinnedTabs) {
    if (isValidUrl(url) && !existingPinnedUrls.includes(url)) {
      try {
        console.log("Rolling out the red carpet for:", url);
        await browser.tabs.create({ url: url, pinned: true });
      } catch (error) {
        console.error(`Oops! ${url} tripped on the way in:`, error);
      }
    }
  }
}

// Wakey wakey, eggs and... pinned tabs?
loadSavedPinnedTabs();

// Tab update paparazzi - always watching!
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.pinned === true) {
    // New celeb in town!
    if (isValidUrl(tab.url) && !pinnedTabs.includes(tab.url)) {
      pinnedTabs.push(tab.url);
      console.log("Welcome to the A-list:", tab.url);
      updateStorage();
    }
  } else if (changeInfo.pinned === false) {
    // Sorry, your 15 minutes of fame are up
    pinnedTabs = pinnedTabs.filter((url) => url !== tab.url);
    console.log("Security, escort this tab out:", tab.url);
    updateStorage();
  }
});

// Time to update our little black book of tabs
function updateStorage() {
  const validPinnedTabs = pinnedTabs.filter(isValidUrl);
  browser.storage.local.set({ pinnedTabs: validPinnedTabs });
  console.log("VIP list updated:", validPinnedTabs);
}

// Adding the "Bye Felicia" option to the menu
browser.contextMenus.create({
  id: "unpin-tab",
  title: "Unpin Tab (Bye Felicia!)",
  contexts: ["tab"],
});

// Listening for the "Bye Felicia" command
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "unpin-tab" && tab.pinned) {
    browser.tabs.update(tab.id, { pinned: false });
  }
});

// Firefox just woke up, time to get this party started!
browser.runtime.onStartup.addListener(() => {
  console.log("Firefox has entered the chat");
  restorePinnedTabs();
});

// New extension, who dis?
browser.runtime.onInstalled.addListener(() => {
  console.log("Extension got a glow-up");
  restorePinnedTabs();
});

// Oh look, a new window! How exciting!
browser.windows.onCreated.addListener(() => {
  console.log("New window, same old tabs");
  restorePinnedTabs();
});
