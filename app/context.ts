import type { PID } from "core/annotationsModel";
import type { ConfRec } from "./config";
import { StorageI } from "app/storage/defs";
import type { Token, AuthErrAction } from "core/http";
import type { UserProfile } from "core/user";
import type { StoredAuth } from "app/api/auth/defs";
import { usersUrl } from "core/user";
import type { SelectionSnapshot } from "./selection";

export interface AuthUser {
  token: Token;
  profile: UserProfile;
}

export interface Target {
  pid: PID; // URI of the landing page
  source?: string; // The resource URI
  selection?: SelectionSnapshot; // A selection on the landing page
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
