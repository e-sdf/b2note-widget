import type { Context } from "../context";
import type { AuthErrAction } from "../api/http";

export enum PagesEnum { 
  ANNOTATE = "annotate",
  ANNOTATIONS = "annotations",
  SEARCH = "search",
  HELP =  "help",
  LOGIN = "login",
  PROFILE = "profile"
}

export interface PageProps {
  context: Context;
  authErrAction: AuthErrAction;
}

