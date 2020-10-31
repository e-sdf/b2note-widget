import type { ConfRec } from "./config";
import * as anModel from "core/annotationsModel";
import type { AnBodyType, Annotation } from "core/annotationsModel";
import { getAnId, getAnBodyType } from "core/annotationsModel";

export enum ActionEnum {
  CREATE = "create",
  EDIT = "edit",
  DELETE = "delete"
}

export interface Notification {
  action: ActionEnum;
  annotationType: AnBodyType;
  annotationIRI: string;
}

export function anNotify(config: ConfRec, action: ActionEnum, an: Annotation): void {
  const n: Notification = {
    action,
    annotationType: getAnBodyType(an.body),
    annotationIRI: config.apiServerUrl + config.apiPath + anModel.annotationsUrl + "/" + getAnId(an)
  };
  parent.postMessage(n, "*");
}

export function notifyLoaded(): void {
  parent.postMessage("B2NOTE loaded", "*");
}
