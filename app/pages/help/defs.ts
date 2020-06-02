export enum HelpSection {
  ABOUT = "about",
  MENU = "menu",
  ANNOTATE = "annotate",
  ANNOTATIONS = "annotations",
  SEARCH = "search",
  LOGIN = "login",
  PROFILE = "profile",
  SUPPORT = "support",
  TOC = "toc"
}

export interface SectionProps {
  header: string;
  redirectFn(section: HelpSection): void;
}
