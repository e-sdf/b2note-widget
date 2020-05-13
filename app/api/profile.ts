import type { Token, AuthErrAction } from "./http";
import { get, patch } from "./http";
import { endpointUrl } from "../config";
import type { UserProfile } from "../core/user";
import { profileUrl } from "../core/user";

const url = endpointUrl + profileUrl;

export function getUserProfilePm(token: Token, authErrAction?: AuthErrAction): Promise<UserProfile> {
  return get<UserProfile>(url, {}, { token, authErrAction });
}

export function patchUserProfilePm(changes: Record<string, any>, token: Token, authErrAction: AuthErrAction): Promise<UserProfile> {
  return patch<UserProfile>(url, { ...changes }, { token, authErrAction });
}
