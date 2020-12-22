import type { ErrorObject } from "ajv";
import Ajv from "ajv";
import { targetInputSchema } from "core/schemas/targetInput.schema";
import type { TargetInput, PageTargetInput, LinkTargetInput } from "core/targetInput";
import { TargetInputType as TIT } from "core/targetInput";

const ajv = new Ajv();
ajv.addSchema(targetInputSchema);

export function validateTargetInput(targetInput: Record<string, any>): Array<ErrorObject> | null | undefined {
  ajv.validate("targetInput#/definitions/TargetInput", targetInput);
  return ajv.errors;
}

export interface TargetInputError {
  error: any;
}

function parseTargetString(targetString: string): TargetInput|TargetInputError {
  try {
    const targetInput = JSON.parse(targetString);
    const errors = validateTargetInput(targetInput);
    return errors ? { error: errors } : targetInput;
  } catch (error) {
    return { error };
  }
}

export function processTargetInput(
{pid, pidName, source, sourceName, targetString}: {
   pid?: string|undefined;
   pidName?: string|undefined;
   source?: string|undefined;
   sourceName?: string|undefined;
   targetString?: string|undefined;
}): TargetInput|null|TargetInputError {
  return (
    targetString ? (() => {
      console.log("[B2NOTE] found `targetString` param, will use that");
      return parseTargetString(targetString); })()
    : pid && !source ?
      { type: TIT.PAGE, pid, ...pidName ? { pidName } : {} } as PageTargetInput
    : pid && source ?
      { type: TIT.LINK, pid, ...pidName ? { pidName } : {}, source, ...sourceName ? { sourceName } : {} } as LinkTargetInput
    :  null
  );
}