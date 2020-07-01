import type { PID } from "./core/annotationsModel";
import config from "./config";
import type { Token } from "./api/http";
import type { UserProfile } from "./core/user";
import { usersUrl } from "./core/user";
import type { Target } from "./core/annotationsModel";

export interface AuthUser {
  token: Token;
  profile: UserProfile;
}

export interface Context {
  mbUser: AuthUser|null;
  mbTarget: Target|null;
}

export function loggedUserPID(context: Context): PID|null {
  return (
    context.mbUser
      ? config.apiServerUrl + config.apiPath + usersUrl + "/" + context.mbUser.profile.id
      : null
  );
}
