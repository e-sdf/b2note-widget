import { AnRecordType } from "../core/annotationsModel";

export { AnRecordType };

export enum NotificationTypeEnum {
  CREATE = "create",
  EDIT = "edit",
  DELETE = "delete"
};

export interface Notification {
  action: NotificationTypeEnum;
  annotationType: AnRecordType;
  annotationId: string;
}

export function notify(n: Notification): void {
  window.postMessage(n, "*");
}
