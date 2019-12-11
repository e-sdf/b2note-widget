import * as peg from "pegjs";
import { TypeFilter } from "../../shared/annotationsModel";
import { OperatorType } from "../../shared/searchModel";

export interface BiOperatorExpr {
  operator: OperatorType.AND | OperatorType.OR | OperatorType.XOR;
  lexpr: Expression;
  rexpr: Expression;
}

export interface UnOperatorExpr {
  operator: OperatorType.NOT;
  expr: Expression;
}

export type Expression = BiOperatorExpr | UnOperatorExpr | TagExpr;

export interface TagExpr {
  type: TypeFilter;
  value: string;
}

export interface ParseError {
  message: string;
  location: number;
}

export interface ParseResult {
  error?: ParseError;
  result?: Expression;
}

const grammar = `
start
  = query

query
  = lexpr:expr lwhite:white "${OperatorType.AND}"i rwhite:white rexpr:query { return { operator: "${OperatorType.AND}", lexpr, rexpr }; }
  / lexpr:expr lwhite:white "${OperatorType.OR}"i rwhite:white rexpr:query { return { operator: "${OperatorType.OR}", lexpr, rexpr }; }
  / lexpr:expr lwhite:white "${OperatorType.XOR}"i rwhite:white rexpr:query { return { operator: "${OperatorType.XOR}", lexpr, rexpr }; }
  / lwhite:white "${OperatorType.NOT}"i rwhite:white expr:expr { return { operator: "${OperatorType.NOT}", expr }; }
  / expr

expr
  = tag 
  / "(" query:query ")" { return query; }

tag
  = "s:" identifier:identifier { return { type: "${TypeFilter.SEMANTIC}", identifier }; }
  / "k:" value:value { return { type: "${TypeFilter.KEYWORD}", value }; }
  / "c:" value:value { return { type: "${TypeFilter.COMMENT}", value }; }

identifier
  = identifier:[a-zA-Z0-9]+ { return identifier.join(""); }

value
  = val:[a-zA-Z0-9]+ { return val.join(""); }
  / '"' val:[^"]+ '"' { return val.join(""); }

white
  = [  ]*

`;

//  / expr [  ]*"OR"i[  ]* expr
//  / expr [  ]*"XOR"i[  ]* expr
//  / '"'[a-zA-Z 0-9]+'"'
const parser = peg.generate(grammar);

export function parse(exp: string): ParseResult {
  try {
    const result = parser.parse(exp); 
    //console.log(result);
    return { result };
  } catch(error) {
    //console.log(error);
    return { error: { message: error.message, location: error.location.start.column } };
  }
}
