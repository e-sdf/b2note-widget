import { User } from "../api/profile";
import { Target } from "../shared/annotationsModel";

export interface Context {
  user: User;
  target: Target;
}

