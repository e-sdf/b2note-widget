import axios from "axios";
import { endpointUrl } from "../config";
import type { Token } from "./auth";
import { mkAuthHeader } from "./auth";
import type { UserProfile } from "../core/user";
import { profileUrl } from "../core/user";
import { axiosErrToMsg } from "../core/utils";

const url = endpointUrl + profileUrl;

export function getUserProfilePm(token: Token): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    axios.get(url, mkAuthHeader(token))
    .then(resp => resolve(resp.data as UserProfile))
    .catch(error => reject(axiosErrToMsg(error)));
  });
}

export function patchUserProfilePm(changes: Record<string, any>, token: Token): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    axios.patch(url, { ...changes }, mkAuthHeader(token))
    .then(resp => resolve(resp.data as UserProfile))
    .catch(error => reject(axiosErrToMsg(error)));
  });
}
