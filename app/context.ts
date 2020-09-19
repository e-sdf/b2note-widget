import type { PID } from "core/annotationsModel";
import type { ConfRec } from "./config";
import { StorageI } from "app/storage/defs";
import type { Token } from "./api/http";
import type { UserProfile } from "core/user";
import type { StoredAuth } from "app/api/auth/defs";
import { usersUrl } from "core/user";

export interface AuthUser {
  token: Token;
  profile: UserProfile;
}

export interface Target {
  pid: PID; // URI of the landing page
  source?: string; // The resource URI
}

export interface Context {
  config: ConfRec;
  authStorage: StorageI<StoredAuth>;
  mbUser: AuthUser|null;
  mbTarget: Target|null;
}

export function isViewMode(context: Context): boolean {
  return context.mbTarget != null && context.mbTarget.source != null;
}

export function loggedUserPID(context: Context): PID|null {
  return (
    context.mbUser
      ? context.config.apiServerUrl + context.config.apiPath + usersUrl + "/" + context.mbUser.profile.id
      : null
  );
}
