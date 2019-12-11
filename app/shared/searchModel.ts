import { TypeFilter } from "./annotationsModel";

export const searchUrl = "/search";

export enum OperatorType { AND = "AND", OR = "OR", XOR = "XOR", NOT = "NOT" }

export interface SearchTerm {
  operator?: OperatorType;
  type: TypeFilter;
  label: string;
}

export interface SearchQuery {
  terms: Array<SearchTerm>;
  includeSynonyms: boolean;
}
