// Background script - opens folders in Finder via native messaging host
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "openFolder" && msg.path) {
    console.log("BG: Sending to native host:", msg.path);
    chrome.runtime.sendNativeMessage(
      "com.pulsaio.folder_opener",
      {path: msg.path},
      function(response) {
        if (chrome.runtime.lastError) {
          console.error("BG: Native messaging error:", chrome.runtime.lastError.message);
          sendResponse({success: false, error: chrome.runtime.lastError.message});
        } else {
          console.log("BG: Native response:", JSON.stringify(response));
          sendResponse(response || {success: true});
        }
      }
    );
    return true;
  }
});
