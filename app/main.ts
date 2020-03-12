import { mkContext } from "./context";
import * as widget from "./widget/view";
import { pidInputElemId, sourceInputElemId } from "./core/widgetDefs";

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
        const context = mkContext({ pid: pidDOM.value, source: sourceDOM.value });
        console.log(context);
        widget.renderWidget(context);
      }
    }
  }
});