import type { PID } from "core/annotationsModel";
import type { ConfRec } from "./config";
import { StorageI } from "app/storage/defs";
import type { AnTarget } from "core/annotationsModel";
import { AnBodyItemType } from "core/annotationsModel";
import type { Token, AuthErrAction } from "core/http";
import type { UserProfile } from "core/user";
import type { StoredAuth } from "app/api/auth/defs";
import { usersUrl } from "core/user";

export interface SelectionSnapshot {
  xPath: string;
  textContent: string;
  startOffset: number;
  endOffset: number;
}

export function ssToString(ss: SelectionSnapshot): string {
  return ss.textContent.substring(ss.startOffset, ss.endOffset);
}

export interface Target {
  pid: string; // URI of the landing page
  source?: string; // The resource URI
  selection?: SelectionSnapshot; // A selection on the landing page
}

export function mkTarget(target: Target): AnTarget {
  const id = target.pid;
  const source = target.source;

  return {
    id,
    ... source ? { source } : {},
    type: AnBodyItemType.SPECIFIC_RESOURCE
  };
}

export interface AuthUser {
  token: Token;
  profile: UserProfile;
}

export interface SysContext {
  config: ConfRec;
  authStorage: StorageI<StoredAuth>;
  mbTarget: Target|null;
}

export interface AppContext {
  mbUser: AuthUser|null;
  authErrAction: AuthErrAction;
}

export function isViewMode(sysContext: SysContext): boolean {
  return sysContext.mbTarget != null && (sysContext.mbTarget.source != null || sysContext.mbTarget.selection != null);
}

export function loggedUserPID(sysContext: SysContext, appContext: AppContext): PID|null {
  return (
    appContext.mbUser
      ? sysContext.config.apiServerUrl + sysContext.config.apiPath + usersUrl + "/" + appContext.mbUser.profile.id
      : null
  );
}
