import axios from "axios";
import { endpointUrl } from "./server";
import { User, UserProfile, profileUrl } from "../core/user";
import { authHeader } from "./utils";

const url = endpointUrl + profileUrl;

export function getUserProfile(user: User): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    axios.get(url, authHeader(user.accessToken)).then(
      res => resolve(res.data as UserProfile),
      err => reject(err)
    );
  });
}

export function patchUserProfile(changes: Record<string, any>, user: User): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    axios.patch(url, { ...changes }, authHeader(user.accessToken)).then(
      res => resolve(res.data as UserProfile),
      err => reject(err)
    ).catch(err => reject(err));
  });
}
