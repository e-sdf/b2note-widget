export enum SearchType { SEMANTIC = "semantic", KEYWORD = "keyword", COMMENT = "comment", REGEX = "regex" };

export enum OperatorType { AND = "AND", OR = "OR", XOR = "XOR", NOT = "NOT" }

export interface BiOperatorExpr {
  operator: OperatorType.AND | OperatorType.OR | OperatorType.XOR;
  lexpr: Sexpr;
  rexpr: Sexpr;
}

export interface UnOperatorExpr {
  operator: OperatorType.NOT;
  expr: Sexpr;
}

export interface TagExpr {
  type: SearchType;
  value: string;
}

export type Sexpr = BiOperatorExpr | UnOperatorExpr | TagExpr;

