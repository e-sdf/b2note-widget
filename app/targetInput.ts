import Ajv from "ajv";
import { targetInputSchema } from "core/schemas/targetInput.schema";
import type { PageTargetInput, LinkTargetInput, TargetInput } from "core/targetInput";

const ajv = new Ajv();
ajv.addSchema(targetInputSchema);

export function validateTargetInput(targetInput: Record<string, any>): Array<Ajv.ErrorObject> | null | undefined {
  ajv.validate("targetInput#/definitions/TargetInput", targetInput);
  return ajv.errors;
}

function parseTargetString(targetString: string): TargetInput|string {
  try {
    const targetInput = JSON.parse(targetString);
    const errors = validateTargetInput(targetInput);
    return errors ? JSON.stringify(errors) : targetInput;
  } catch (error) {
    return "Invalid JSON" + JSON.stringify(error);
  }
}

export function processTargetInput(
{pid, pidName, source, sourceName, targetString}: {
   pid: string|undefined;
   pidName: string|undefined;
   source: string|undefined;
   sourceName: string|undefined;
   targetString: string|undefined;
}): TargetInput|null|string {
  return (
    targetString ? (() => {
      console.log("[B2NOTE] found `targetString` param, will use that");
      return parseTargetString(targetString); })()
    : pid && !source ?
      { type: "PageTarget", pid, pidName } as PageTargetInput
    : pid && source ?
      { type: "LinkTarget", pid, pidName, source, sourceName } as LinkTargetInput
    :  null
  );
}