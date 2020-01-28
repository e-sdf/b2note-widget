import { UserProfile } from "../core/profile";
import { Target } from "../core/annotationsModel";

export interface Context {
  user: UserProfile|null;
  target: Target;
}

export function mkContext(target: Target): Context {
  return {
    user: null,
    target
  };
}

export function isUserLogged(context: Context): boolean {
  return context.user !== null;
}

