import type { User, UserProfile } from "./core/user";
import type { Target } from "./core/annotationsModel";

export interface Context {
  user: User|null;
  userProfile: UserProfile|null;
  target: Target;
}

export function mkContext(target: Target): Context {
  return {
    user: null,
    userProfile: null,
    target
  };
}

export function isUserLogged(context: Context): boolean {
  return context.user !== null;
}

