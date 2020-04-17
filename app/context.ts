import type { User, UserProfile } from "./core/user";
import type { Target } from "./core/annotationsModel";

export interface Context {
  mbUser: User|null;
  mbUserProfile: UserProfile|null;
  mbTarget: Target|null;
}

export function isUserLogged(context: Context): boolean {
  return context.mbUser !== null;
}

