import axios from "axios";
import { endpointUrl } from "./server";
import { Context } from "../components/context";
import * as profile from "../core/profile";
import { authHeader } from "./utils";

const profileUrl = endpointUrl + profile.profileUrl;

export function patchUserProfile(changes: Record<keyof profile.UserProfile, string>, context: Context): Promise<any> {
  if (context.user) {
    return axios.patch(profileUrl, { ...changes }, authHeader(context.user.accessToken));
  } else {
    return Promise.reject("Token not present");
  }
}
