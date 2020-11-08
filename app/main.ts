import { config } from "./config";
import { SelectionSnapshot } from "./context";
import * as widget from "./widget/view";
import authStorage from "app/api/auth/storage-window";

const pidInputElemId = "pid-input";
const sourceInputElemId = "source-input";


function mkSelection(): SelectionSnapshot|undefined {
  const [xPath, textContent, startOffsetStr, endOffsetStr] = 
    ["xpath-input", "text-content-input", "start-offset-input", "end-offset-input"].map(
      elemId => (document.getElementById(elemId) as HTMLInputElement)?.value
    );
  const [startOffset, endOffset] = [parseInt(startOffsetStr), parseInt(endOffsetStr)];

  return (
    xPath && textContent && !isNaN(startOffset) && !isNaN(endOffset) ?
      { xPath, textContent, startOffset, endOffset }
    : undefined
  );
      
}

$(() => {
  if (widget.canRenderWidgetInfo()) {
    widget.renderWidgetInfo();
  } else if (widget.canRenderWidget()) {
    const pidDOM = document.getElementById(pidInputElemId) as HTMLInputElement;
    if (!pidDOM?.value) {
      console.error(`<input type="hidden" id="${pidInputElemId}" value="..."> element not found in DOM`);
    } else {
      const sourceDOM = document.getElementById(sourceInputElemId) as HTMLInputElement;
      const selection = mkSelection();
      widget.renderWidget({ 
        config,
        authStorage,
        mbTarget: { pid: pidDOM.value, source: sourceDOM?.value, selection }
      });
    }
  }
});