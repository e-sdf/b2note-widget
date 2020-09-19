import type { ConfRec } from "../config";
import type { AnnotationType, Annotation } from "core/annotationsModel";
import * as anModel from "core/annotationsModel";
import { getAnId, getAnType } from "core/annotationsModel";

export enum ActionEnum {
  CREATE = "create",
  EDIT = "edit",
  DELETE = "delete"
}

export interface Notification {
  action: ActionEnum;
  annotationType: AnnotationType;
  annotationIRI: string;
}

export function anNotify(config: ConfRec, action: ActionEnum, an: Annotation): void {
  const n: Notification = {
    action,
    annotationType: getAnType(an),
    annotationIRI: config.apiServerUrl + config.apiPath + anModel.annotationsUrl + "/" + getAnId(an)
  };
  parent.postMessage(n, "*");
}

export function notifyLoaded(): void {
  parent.postMessage("B2NOTE loaded", "*");
}
