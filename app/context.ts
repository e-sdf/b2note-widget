import type { AuthUser } from "./api/auth";
import type { Target } from "./core/annotationsModel";

export interface Context {
  mbUser: AuthUser|null;
  mbTarget: Target|null;
}

export function isUserLogged(context: Context): boolean {
  return context.mbUser !== null;
}

