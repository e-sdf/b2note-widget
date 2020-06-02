import type { Token, AuthErrAction } from "./http";
import { get, patch } from "./http";
import config from "../config";
import type { UserProfile } from "../core/user";
import { usersUrl } from "../core/user";

const url = config.apiServerUrl + config.apiPath + usersUrl;

export function getUserProfilePm(token: Token, authErrAction?: AuthErrAction): Promise<UserProfile> {
  return get<UserProfile>(url, {}, { token, authErrAction });
}

export function patchUserProfilePm(changes: Record<string, any>, token: Token, authErrAction: AuthErrAction): Promise<UserProfile> {
  return patch<UserProfile>(url, { ...changes }, { token, authErrAction });
}
