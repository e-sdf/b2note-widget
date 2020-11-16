import type { Token, AuthErrAction } from "core/http";
import { get, patch } from "core/http";
import type { ConfRec } from "app/config";
import type { UserProfile } from "core/user";
import { usersUrl, customOntologyUrl } from "core/user";
import { OntologyMeta } from "core/ontologyRegister";

function getProfileUrl(config: ConfRec): string {
  return config.apiServerUrl + config.apiPath + usersUrl;
}

function getCustomOntologyUrl(config: ConfRec): string {
  return config.apiServerUrl + config.apiPath + customOntologyUrl;
}

export function getUserProfilePm(config: ConfRec, token: Token, authErrAction?: AuthErrAction): Promise<UserProfile> {
  return get<UserProfile>(getProfileUrl(config), {}, { token, authErrAction });
}

export function patchUserProfilePm(config: ConfRec, changes: Record<string, any>, token: Token, authErrAction: AuthErrAction): Promise<UserProfile> {
  return patch<UserProfile>(getProfileUrl(config), { ...changes }, { token, authErrAction });
}

export function getCustomOntologiesMetasPm(config: ConfRec, token: Token, authErrAction: AuthErrAction): Promise<Array<OntologyMeta>> {
  return get(getCustomOntologyUrl(config), {}, { token, authErrAction });
}
