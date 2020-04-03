import _ from "lodash";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import * as icons from "../../components/icons";
import * as anModel from "../../core/annotationsModel";
import type { AnRecord, SearchQuery } from "../../core/annotationsModel";
import { SearchType, BiOperatorType } from "../../core/searchModel";
import * as queryParser from "../../core/searchQueryParser";
import * as api from "../../api/annotations";
import { showAlertError, SpinningWheel } from "../../components/ui"; 
import { TermComp } from "./termComp";

const alertId = "basic-search-alert";

export interface SearchProps {
  resultsHandle(results: Array<AnRecord>): void;
}

export function Search(props: SearchProps): React.FunctionComponentElement<SearchProps> {
  const [termType, setTermType] = React.useState(SearchType.REGEX);
  const [termValue, setTermValue] = React.useState("");
  const [includeSynonyms, setIncludeSynonyms] = React.useState(false);
  const [queryStr, setQueryStr] = React.useState("");
  const [queryError, setQueryError] = React.useState(null as queryParser.ParseError|null);
  const [searching, setSearching] = React.useState(false);

  function queryChanged(query: string): void {
    setQueryStr(query);
    const res = queryParser.parse(_.trim(query));
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

  function add(s: string): void {
    setQueryStr(queryStr + s);
  }

  function submitQuery(): void {
    setSearching(true);
    api.searchAnnotations({ expression: _.trim(queryStr) }).then(
      (anl: Array<anModel.AnRecord>) => {
        setSearching(false);
        props.resultsHandle(anl);
      },
      (err) => {
        setSearching(false);
        showAlertError(alertId, err);
      }
    );
  }

  function renderAddTermButton(): React.ReactElement {
    return (
      <div style={{paddingLeft: "10px"}}>
        <button type="button" className="btn btn-block btn-outline-primary" style={{height: "100%"}}
          data-toggle="tooltip" data-placement="bottom" title="Add"
          onClick={() => { 
            add(termStr(termType, termValue, includeSynonyms));
            setTermValue("");
          }}>
          <icons.AddIcon/> 
        </button>
      </div>
    );
  }

  function renderConnectives(): React.ReactElement {
    return (
      <>
        <label>Add logical connective:</label>
        <div>
          <button type="button" className="btn btn-sm btn-outline-primary ml-1 mr-1"
            onClick={() => add(" AND ")}>AND</button>
          <button type="button" className="btn btn-sm btn-outline-primary ml-1 mr-1"
            onClick={() => add(" OR ")}>OR</button>
          <button type="button" className="btn btn-sm btn-outline-primary ml-1 mr-1"
            onClick={() => add(" XOR ")}>XOR</button>
          <button type="button" className="btn btn-sm btn-outline-primary ml-1 mr-1"
            onClick={() => add(" NOT ")}>NOT</button>
        </div>
      </> 
    );
  }

  function renderQueryBuilder(): React.ReactElement {
    return (
      <div className="card">
        <div className="card-header" style={{padding: "5px 10px"}}
          data-toggle="tooltip" data-placement="bottom" title="Here you can build your search query graphically">
          Query Builder <icons.HelpIcon/>
        </div>
        <div className="card-body" style={{padding: "10px"}}>
          <label>Add search term:</label>
          <div className="form-group d-flex flex-row">
            <TermComp 
              updateAnTypeHandle={setTermType}
              updateValueHandle={setTermValue}
              updateSynonymsHandle={setIncludeSynonyms}/>
            {renderAddTermButton()}
          </div>
          {renderConnectives()}
        </div>
      </div>
    );
  }

  function renderQueryEditor(): React.ReactElement {
    return (
      <div className="card mb-2">
        <div className="card-header" style={{padding: "5px 10px"}}
          data-toggle="tooltip" data-placement="bottom" title="Here you can adjust the resulting query or write it manually. Check the help for the exact syntax.">
          Resulting search query <icons.HelpIcon/>
        </div>
        <div className="card-body" style={{padding: "10px"}}>
          <label>Query Editor</label>
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
      </div>
    );
  }

  function renderSearchButton(): React.ReactElement {
    return (
      <div className="d-flex flex-row justify-content-center">
        <button type="button" className="btn btn-primary" style={{width: "100px"}}
          data-toggle="tooltip" data-placement="bottom" title="Make search"
          disabled={queryStr.length === 0 || queryError !== null}
          onClick={submitQuery}>
          <icons.SearchIcon/> Search 
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {renderQueryBuilder()}
      {renderQueryEditor()}
      {renderSearchButton()}
      <div className="row justify-content-center">
        <SpinningWheel show={searching}/>
      </div>
      <div id={alertId}></div>
    </div>
  );
}
