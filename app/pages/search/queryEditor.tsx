import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import * as icons from "../../components/icons";
import { SearchType, BiOperatorType } from "../../core/searchModel";
import * as queryParser from "../../core/searchQueryParser";

export interface QueryEditorProps {
  addTerm(tType: SearchType, tVal: string, inclSyns: boolean): void;
  updateHandle(value: string): void;
}

export function QueryEditor(props: QueryEditorProps): React.FunctionComponentElement<QueryEditorProps> {
  const [queryStr, setQueryStr] = React.useState("");
  const [queryError, setQueryError] = React.useState(null as queryParser.ParseError|null);

  function queryChanged(query: string): void {
    setQueryStr(query);
    const res = queryParser.parse(query);
    setQueryError(res.error ? res.error : null);
  }
  
  function termStr(tType: SearchType, tVal: string, inclSyns: boolean): string {
    const quotize: (s: string) => string = (s) => s.includes(" ") ? `"${s}"` : s;

    return matchSwitch(tType, {
      [SearchType.REGEX]: () => `r:/${tVal}/`,
        [SearchType.SEMANTIC]: () => `s:${quotize(tVal)}${inclSyns ? "+s" : ""}`,
      [SearchType.KEYWORD]: () => `k:${quotize(tVal)}`,
      [SearchType.COMMENT]: () => `c:${quotize(tVal)}`,
    });
  }

  function addTerm(tType: SearchType, tVal: string, inclSyns: boolean): void {
    setQueryStr(queryStr + termStr(tType, tVal, inclSyns)); 
  }

  //function renderHelp(): React.ReactElement {
    //return (
      //<div className="card form-group">
        //<div className="card-header" style={{padding: "5px"}}>
          //<span>Syntax help</span>
          //<button type="button" 
            //className="btn btn-sm btn-outline-primary list-action-button"
            //style={{padding: "0 4px 3px 0"}}
            //onClick={() => setShowHelp(!showHelp)}>
            //{showHelp ? <icons.HideIcon/> : <icons.ShowIcon/>}
          //</button>
        //</div>
        //{showHelp ? 
          //<div className="card-body" style={{padding: "5px"}}>
            //<div className="text-smaller text-secondary">
              //<p>
                //Example query:<br/>
                //<span style={{fontFamily: "monospace"}}>s:semantic1 AND (k:keyword1 OR c:&quot;comment words&quot;) XOR r:/regex/</span><br/>
                //Binary operators: <span style={{fontFamily: "monospace"}}>AND</span>, <span style={{fontFamily: "monospace"}}>OR</span>, <span style={{fontFamily: "monospace"}}>XOR</span><br/>
                //Unary operator: <span style={{fontFamily: "monospace"}}>NOT</span>
              //</p>
              //<p>
                //Semantic tags are placeholders and must be filled through ontology search fields.
              //</p>
            //</div>
          //</div>
        //: <></>}
      //</div>
    //);
  //}

  return (
    <div className="form-group">
      <label>Search query</label>
      <div className="d-flex flex-row">
        <textarea style={{ width: "100%" }}
          value={queryStr}
          onChange={(ev) => queryChanged(ev.target.value)}
        />
        {queryStr.length > 0 ?
          <div className="ml-1"
            data-toggle="tooltip" data-placement="bottom" title={queryError ? `Error at ${queryError.location}: ${queryError.message}` : ""}>
            {queryError ? 
              <icons.ErrorIcon className="text-danger" /> 
            : <icons.OKIcon className="text-success" />}
          </div>
          : ""}
      </div>
    </div>
  );
}

