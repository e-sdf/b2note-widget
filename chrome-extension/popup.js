var popupWindow = window.open(
  chrome.extension.getURL("widget_popup.html"),
  "b2note",
  "width=310,height=567,location=no,menubar=no,resizable=no,status=no,titlebar=no,toolbar=no"
);
window.close(); // close the Chrome extension pop-up
