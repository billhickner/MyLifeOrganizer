// Background script - opens folders in Chrome file browser
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "openFolder" && msg.path) {
    // Ensure trailing slash so Chrome shows directory listing
    var path = msg.path;
    if (!path.endsWith("/")) path += "/";
    var url = "file://" + path;
    console.log("BG: Opening", url);
    chrome.tabs.create({url: url, active: true}, function(tab) {
      if (chrome.runtime.lastError) {
        console.error("BG:", chrome.runtime.lastError.message);
        sendResponse({success: false, error: chrome.runtime.lastError.message});
      } else {
        sendResponse({success: true});
      }
    });
    return true;
  }
});
