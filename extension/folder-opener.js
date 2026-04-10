// Folder Opener - Content script for PulsAIO Command Center
// Runs in extension context with chrome.runtime access
console.log("FOLDER-OPENER: Content script loaded on", window.location.href);

window.addEventListener("message", function(event) {
  if (event.source !== window) return;
  if (event.data && event.data.type === "PULSAIO_OPEN_FOLDER" && event.data.path) {
    console.log("FOLDER-OPENER: Got request to open:", event.data.path);
    try {
      chrome.runtime.sendMessage({action: "openFolder", path: event.data.path}, function(response) {
        console.log("FOLDER-OPENER: Background response:", JSON.stringify(response));
        if (chrome.runtime.lastError) {
          console.error("FOLDER-OPENER: Error:", chrome.runtime.lastError.message);
        }
      });
    } catch(e) {
      console.error("FOLDER-OPENER: sendMessage failed:", e.message);
    }
  }
});
