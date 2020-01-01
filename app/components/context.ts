import { User } from "../api/profile";
import { Target } from "../core/annotationsModel";

export interface Context {
  user: User;
  target: Target;
}

