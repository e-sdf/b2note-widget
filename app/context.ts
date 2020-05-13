import type { Token } from "./api/http";
import type { UserProfile } from "./core/user";
import type { Target } from "./core/annotationsModel";

export interface AuthUser {
  token: Token;
  profile: UserProfile;
}

export interface Context {
  mbUser: AuthUser|null;
  mbTarget: Target|null;
}

export function isUserLogged(context: Context): boolean {
  return context.mbUser !== null;
}

