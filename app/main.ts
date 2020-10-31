import { config } from "./config";
import * as widget from "./widget/view";
import { pidInputElemId, sourceInputElemId } from "core/widgetDefs";
import authStorage from "app/api/auth/storage-window";

$(document).ready(() => {
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
        widget.renderWidget({ config, authStorage, mbTarget: { pid: pidDOM.value, source: sourceDOM.value } });
      }
    }
  }
});