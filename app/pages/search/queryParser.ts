import * as peg from "pegjs";
import { SearchType, Sexpr, OperatorType } from "../../shared/searchModel";

export interface ParseError {
  message: string;
  location: number;
}

export interface ParseResult {
  error?: ParseError;
  result?: Sexpr;
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
  = "s:" identifier:identifier { return { type: "${SearchType.SEMANTIC}", identifier }; }
  / "k:" value:value { return { type: "${SearchType.KEYWORD}", value }; }
  / "c:" value:value { return { type: "${SearchType.COMMENT}", value }; }
  / "r:/" value:value "/" { return { type: "${SearchType.REGEX}", value }; }

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
