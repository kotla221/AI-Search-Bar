chrome.action.onClicked.addListener((tab) => {
  const url = chrome.runtime.getURL("newtab.html");

  if (tab.id) {
    chrome.tabs.update(tab.id, { url });
    return;
  }

  chrome.tabs.create({ url });
});
