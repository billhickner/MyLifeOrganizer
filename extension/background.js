// Background script - opens folders
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "openFolder" && msg.path) {
    console.log("BG: Opening folder:", msg.path);
    // Build a proper file URL
    var url = "file://" + msg.path;
    chrome.tabs.create({url: url, active: true}, function(tab) {
      if (chrome.runtime.lastError) {
        console.error("BG: tabs.create error:", chrome.runtime.lastError.message);
        sendResponse({success: false, error: chrome.runtime.lastError.message});
      } else {
        console.log("BG: Opened tab", tab.id);
        sendResponse({success: true, tabId: tab.id});
      }
    });
    return true;
  }
});
