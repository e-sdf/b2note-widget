import { config } from "./config";
import * as targets from "./targetInput";
import * as widget from "./widget/view";
import authStorage from "app/api/auth/storage-window";

const pidInputElemId = "pid-input";
const pidNameInputElemId = "pid-name-input";
const sourceInputElemId = "source-input";
const sourceNameInputElemId = "source-name-input";
const targetInputElemId = "target-input";

function getInputItem(elemId: string): string|undefined {
 return (document.getElementById(elemId) as HTMLInputElement)?.value; 
}

$(() => {
  if (widget.canRenderWidgetInfo()) {
    widget.renderWidgetInfo();
  } else if (widget.canRenderWidget()) {
    const pid = getInputItem(pidInputElemId);
    const pidName = getInputItem(pidNameInputElemId);
    const source = getInputItem(sourceInputElemId);
    const sourceName = getInputItem(sourceNameInputElemId);
    const targetString = getInputItem(targetInputElemId);
    const targetOrMsg = targets.processTargetInput({ pid, pidName, source, sourceName, targetString });
    if (typeof targetOrMsg === "string") {
      console.error("[B2NOTE] input parameters error: " + targetOrMsg);
    }  else {
      widget.renderWidget({
        config,
        authStorage,
        mbTarget: targetOrMsg
      });
    }
  }
});