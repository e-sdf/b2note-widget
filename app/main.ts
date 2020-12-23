import { config } from "./config";
import type { TargetInput } from "core/targetInput";
import type { TargetInputError } from "./targetInput";
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
    const targetOrErrorOrNull = targets.processTargetInput({ pid, pidName, source, sourceName, targetString });
    if (!targetOrErrorOrNull) {
      console.log("[B2NOTE] no (allowed) input parameters");
    } else {
      if ((targetOrErrorOrNull as TargetInputError).error) {
        console.error("[B2NOTE] input parameters error: ");
        console.error((targetOrErrorOrNull as TargetInputError).error);
      }  else {
        widget.renderWidget({
          config,
          authStorage,
          mbTarget: targetOrErrorOrNull as TargetInput
        });
      }
    }
  }
});