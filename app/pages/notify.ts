import config from "../config";
import type { AnRecordType, AnRecord } from "../core/annotationsModel";
import { getAnId, getAnType } from "../core/annotationsModel";

export enum ActionEnum {
  CREATE = "create",
  EDIT = "edit",
  DELETE = "delete"
}

export interface Notification {
  action: ActionEnum;
  annotationType: AnRecordType;
  annotationIRI: string;
}

export function notify(action: ActionEnum, an: AnRecord): void {
  const n: Notification = {
    action,
    annotationType: getAnType(an),
    annotationIRI: config.apiServerUrl + config.apiPath + "/" + getAnId(an)
  };
  window.postMessage(n, "*");
}
