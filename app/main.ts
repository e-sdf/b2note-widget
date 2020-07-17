import { config } from "./config";
import * as widget from "./widget/view";
import { pidInputElemId, sourceInputElemId } from "core/widgetDefs";
import { notifyLoaded } from "client/components/notify";

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
        widget.renderWidget({ config, mbUser: null, mbTarget: { pid: pidDOM.value, source: sourceDOM.value } });
      }
    }
  }
  notifyLoaded();
});