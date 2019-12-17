export type Page = "annotate" | "annotations" | "search" | "help" | "profile";

export const shorten = (lbl: string, lng: number): string => lbl.length > lng ? lbl.substring(0, lng) + "..." : lbl;


