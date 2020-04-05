import axios from "axios";
import { endpointUrl } from "../config";
import type { User, UserProfile } from "../core/user";
import { profileUrl } from "../core/user";
import { authHeader } from "./utils";
import { axiosErrToMsg } from "../core/utils";

const url = endpointUrl + profileUrl;

export function getUserProfilePm(user: User): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    axios.get(url, authHeader(user.accessToken))
    .then(resp => resolve(resp.data as UserProfile))
    .catch(error => reject(axiosErrToMsg(error)));
  });
}

export function patchUserProfilePm(changes: Record<string, any>, user: User): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    axios.patch(url, { ...changes }, authHeader(user.accessToken))
    .then(resp => resolve(resp.data as UserProfile))
    .catch(error => reject(axiosErrToMsg(error)));
  });
}
