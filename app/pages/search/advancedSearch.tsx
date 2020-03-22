/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import * as icons from "../../components/icons";
import * as anModel from "../../core/annotationsModel";
import * as ac from "../../components/autocomplete/view";
import * as api from "../../api/annotations";
import { showAlertError, SpinningWheel } from "../../components/ui"; 
import * as queryParser from "../../core/searchQueryParser";

const alertId = "advanced-search-alert";

export interface AdvancedSearchProps {
  resultsHandle(results: Array<anModel.AnRecord>): void;
}

export function AdvancedSearch(props: AdvancedSearchProps): React.FunctionComponentElement<AdvancedSearchProps> {
  const [showHelp, setShowHelp] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [queryStr, setQueryStr] = React.useState("");
  const [queryError, setQueryError] = React.useState(null as queryParser.ParseError|null);
  const [semanticTagsList, setSemanticTagsList] = React.useState([] as Array<string>);
  const [semanticTagsDict, setSemanticTagsDict] = React.useState({} as Record<string, string>);

  function queryChanged(query: string): void {
    setQueryStr(query);
    const res = queryParser.parse(query);
    setQueryError(res.error ? res.error : null);
    const tags = query.match(/s:[a-zA-Z0-9]+/g)?.map(m => m.substring(2, m.length));
    setSemanticTagsList(!res.error && tags ? tags : []);
    // TODO: synchronize semanticTagsDict
  }
  
  function tagFilled(tag: string, suggestions: Array<ac.Suggestion>): void {
    const value = suggestions[0].labelOrig || "";
    setSemanticTagsDict({ ...semanticTagsDict, [tag]: value });
  }

  function fillIdentifiers(query: string): string {
    return semanticTagsList.reduce((acc, ident) => acc.replace(ident, semanticTagsDict[ident]), query);
  }

  function submitQuery(): void {
    const query = fillIdentifiers(queryStr);
    setSearching(true);
    api.searchAnnotations({ expression: query }).then(
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

  function renderHelp(): React.ReactElement {
    return (
      <div className="card form-group">
        <div className="card-header" style={{padding: "5px"}}>
          <span>Syntax help</span>
          <button type="button" 
            className="btn btn-sm btn-outline-primary list-action-button"
            style={{padding: "0 4px 3px 0"}}
            onClick={() => setShowHelp(!showHelp)}>
            {showHelp ? <icons.HideIcon/> : <icons.ShowIcon/>}
          </button>
        </div>
        {showHelp ? 
          <div className="card-body" style={{padding: "5px"}}>
            <div className="text-smaller text-secondary">
              <p>
                Example query:<br/>
                <span style={{fontFamily: "monospace"}}>s:semantic1 AND (k:keyword1 OR c:&quot;comment words&quot;) XOR r:/regex/</span><br/>
                Binary operators: <span style={{fontFamily: "monospace"}}>AND</span>, <span style={{fontFamily: "monospace"}}>OR</span>, <span style={{fontFamily: "monospace"}}>XOR</span><br/>
                Unary operator: <span style={{fontFamily: "monospace"}}>NOT</span>
              </p>
              <p>
                Semantic tags are placeholders and must be filled through ontology search fields.
              </p>
            </div>
          </div>
        : <></>}
      </div>
    );
  }

  function renderQueryEditor(): React.ReactElement {
    return (
      <>
        <label>Query editor</label>
        <div className="form-group d-flex flex-row">
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
      </>
    );
  }
  
  function renderFinalQuery(): React.ReactElement {
    return (
      <div className="card form-group">
        <div className="card-header" style={{padding: "5px"}}>
          Ontology search for semantic tags
        </div>
        <div className="card-body" style={{padding: "5px"}}>
          {semanticTagsList.length > 0 ?
            semanticTagsList.map((st, i) => 
              <div key={i} className="form-group">
                <span>{st}: </span>
                <ac.SemanticAutocomplete
                  id="advancedSearch-semantic-autocomplete"
                  onChange={suggestions => tagFilled(st, suggestions)}/>
              </div>
            )
          : <span className="text-smaller text-secondary">None</span>}
        </div>
      </div>
    );
  }

  function renderSubmitButton(): React.ReactElement {
    return (
      <div className="form-group">
        <button type="button" className="btn btn-primary" style={{marginLeft: "10px"}}
          data-toggle="tooltip" data-placement="bottom" title="Make search"
          onClick={submitQuery}
          disabled={queryStr.length === 0 || queryError !== null}>
          <icons.SearchIcon/> 
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {renderHelp()}
      {renderQueryEditor()}
      {renderFinalQuery()}
      {renderSubmitButton()}
      <div className="row justify-content-center">
        <SpinningWheel show={searching}/>
      </div>
      <div id={alertId}></div>
    </div>
  );
}

