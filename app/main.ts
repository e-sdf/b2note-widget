import * as config from "./config";
import * as widget from "./widget/view";
import { pidInputElemId, sourceInputElemId } from "./core/widgetDefs";

$(document).ready(() => {
  if (config.chromeExtension) {
    chrome.storage.local.get(
      ["b2notePid", "b2noteSource"],
      (result) => {
        const pid = result.b2notePid;
        const source = result.b2noteSource;
        if (!pid || !source) {
          widget.renderWidget({ mbUser: null, mbUserProfile: null, mbTarget: null });
        } else {
          widget.renderWidget({ mbUser: null, mbUserProfile: null, mbTarget: { pid, source } });
        }
      }
    );
  } else {
    if (widget.canRenderWidgetInfo()) {
      widget.renderWidgetInfo();
    } else if (widget.canRenderWidget()) {
      const pidDOM = document.getElementById(pidInputElemId) as HTMLInputElement;
      if (!pidDOM || !pidDOM.value) {
        console.error(`<input type="hidden" id="${pidInputElemId}" value="..."> element not found in DOM`);
      } else {
        const sourceDOM = document.getElementById(sourceInputElemId) as HTMLInputElement;
        if (!sourceDOM || !sourceDOM.value) {
          console.error(`<input type="hidden" id="${sourceInputElemId}" value="..."> element not found in DOM`);
        } else {
          widget.renderWidget({ mbUser: null, mbUserProfile: null, mbTarget: { pid: pidDOM.value, source: sourceDOM.value } });
        }
      }
    }
  }
});