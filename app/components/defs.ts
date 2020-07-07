import type { Context } from "../context";
import type { AuthErrAction } from "../api/http";

export const b2noteBlue = "#1C418F";

export interface ApiComponent {
  context: Context;
  authErrAction: AuthErrAction;
}