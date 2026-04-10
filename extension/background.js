// Background script - opens folders in Finder via native messaging
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action === "openFolder" && msg.path) {
    console.log("BG: Opening folder:", msg.path);
    try {
      chrome.runtime.sendNativeMessage(
        "com.pulsaio.folder_opener",
        {path: msg.path},
        function(response) {
          console.log("BG: Native response:", JSON.stringify(response));
          if (chrome.runtime.lastError) {
            console.error("BG: Native error:", chrome.runtime.lastError.message);
            // Fallback: try opening in Chrome tab
            var encodedPath = msg.path.split("/").map(encodeURIComponent).join("/");
            chrome.tabs.create({url: "file://" + encodedPath, active: true});
          }
          sendResponse(response || {success: true});
        }
      );
    } catch(e) {
      console.error("BG: Exception:", e.message);
      sendResponse({success: false, error: e.message});
    }
    return true;
  }
});
