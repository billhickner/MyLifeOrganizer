// Background script - handles folder opening via Chrome extension
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "openFolder" && msg.path) {
    // Opens the folder in Finder as a new tab
    chrome.tabs.create({url: "file://" + msg.path, active: true});
    sendResponse({success: true});
  }
  return true;
});
