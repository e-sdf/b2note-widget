var windowId;
const b2notePidKey = "b2notePid";
const b2noteSourceKey = "b2noteSource";

chrome.runtime.onInstalled.addListener(() => {
  menuId = chrome.contextMenus.create({ title: "Annotate in B2NOTE", contexts: ["link"], id: "b2note-create"});
});

chrome.contextMenus.onClicked.addListener((item, tab) => {
  chrome.storage.local.set({
    [b2notePidKey]: item.pageUrl,
    [b2noteSourceKey]: item.linkUrl
  });
  chrome.windows.create(
    { url : "widget_popup.html" },
    window => { windowId = window.id; }
  );
});

chrome.windows.onRemoved.addListener(
  wid => {
    if (wid === windowId) {
      chrome.storage.local.remove(b2notePidKey);
      chrome.storage.local.remove(b2noteSourceKey);
    }
  }
);
