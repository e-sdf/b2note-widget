import { config } from "./config";
import * as targets from "./targets";
import * as widget from "./widget/view";
import authStorage from "app/api/auth/storage-window";

const pidInputElemId = "pid-input";
const pidNameInputElemId = "pid-name-input";
const sourceInputElemId = "source-input";
const sourceNameInputElemId = "source-name-input";
const svgSelectionInputElemId = "svg-selector-input";

function getInputItem(elemId: string): string|undefined {
 return (document.getElementById(elemId) as HTMLInputElement)?.value; 
}

function mkTextSelection(): targets.TextSelection|undefined {
  const [xPath, selectedText, startOffsetStr, endOffsetStr] = 
    ["xpath-input", "text-content-input", "start-offset-input", "end-offset-input"].map(
      elemId => (document.getElementById(elemId) as HTMLInputElement)?.value
    );
  const [startOffset, endOffset] = [parseInt(startOffsetStr), parseInt(endOffsetStr)];

  return (
    xPath && selectedText && !isNaN(startOffset) && !isNaN(endOffset) ?
      { selectedText, xPath, startOffset, endOffset }
    : undefined
  );
}

$(() => {
  if (widget.canRenderWidgetInfo()) {
    widget.renderWidgetInfo();
  } else if (widget.canRenderWidget()) {
    const pid = getInputItem(pidInputElemId);
    const pidName = getInputItem(pidNameInputElemId);
    const source = getInputItem(sourceInputElemId);
    const sourceName = getInputItem(sourceNameInputElemId);
    const textSelection = mkTextSelection();
    const svgSelection = getInputItem(svgSelectionInputElemId);
    const mbTarget = targets.guessTarget({ pid, pidName, source, sourceName, textSelection, svgSelection });
    widget.renderWidget({
      config,
      authStorage,
      mbTarget
    });
  }
});