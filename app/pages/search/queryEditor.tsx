import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import * as icons from "client/components/icons";
import { SearchType } from "core/searchModel";
import * as queryParser from "core/searchQueryParser";

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
