// Folder Opener - Content script for PulsAIO Command Center
// Listens for folder open requests from the web page and forwards to background script
window.addEventListener("message", function(event) {
  if (event.source !== window) return;
  if (event.data && event.data.type === "PULSAIO_OPEN_FOLDER" && event.data.path) {
    chrome.runtime.sendMessage({action: "openFolder", path: event.data.path});
  }
});
