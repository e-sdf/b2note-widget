import axios from "axios";
import { endpointUrl } from "../config";
import { User, UserProfile, profileUrl } from "../core/user";
import { authHeader } from "./utils";
import { axiosErrToMsg } from "../components/utils";

const url = endpointUrl + profileUrl;

export function getUserProfile(user: User): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    axios.get(url, authHeader(user.accessToken))
    .then(resp => resolve(resp.data as UserProfile))
    .catch(error => reject(axiosErrToMsg(error)));
  });
}

export function patchUserProfile(changes: Record<string, any>, user: User): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    axios.patch(url, { ...changes }, authHeader(user.accessToken))
    .then(resp => resolve(resp.data as UserProfile))
    .catch(error => reject(axiosErrToMsg(error)));
  });
}
