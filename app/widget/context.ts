import { User } from "../api/profile";
import { Resource } from "../api/resource";

export interface Context {
  user: User
  resource: Resource;
}

