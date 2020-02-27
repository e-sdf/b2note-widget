/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import * as icons from "react-icons/fa";
import * as anModel from "../../core/annotationsModel";
import * as ac from "../../components/autocomplete/view";
import * as api from "../../api/annotations";
import { showAlertError } from "../../components/ui"; 
import * as queryParser from "../../core/searchQueryParser";

const OKIcon = icons.FaCheck;
const ErrorIcon = icons.FaExclamation;
const SearchIcon = icons.FaSearch;

const alertId = "advanced-search-alert";

export interface AdvancedSearchProps {
  resultsHandle(results: Array<anModel.AnRecord>): void;
}

export function AdvancedSearch(props: AdvancedSearchProps): React.FunctionComponentElement<AdvancedSearchProps> {
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

  //React.useEffect(() => console.log(semanticTagsDict), [semanticTagsDict]);
  //React.useEffect(() => console.log(semanticTagsList), [semanticTagsList]);

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

  function Help(): React.FunctionComponentElement<{}> {
    return (
      <p className="query-syntax-text text-secondary">
        Example query:<br/>
        <span style={{fontFamily: "monospace"}}>s:semantic1 AND (k:keyword1 OR c:&quot;comment words&quot;) XOR r:/regex/</span><br/>
        Binary operators: <span style={{fontFamily: "monospace"}}>AND</span>, <span style={{fontFamily: "monospace"}}>OR</span>, <span style={{fontFamily: "monospace"}}>XOR</span><br/>
        Unary operator: <span style={{fontFamily: "monospace"}}>NOT</span>
      </p>
    );
  }

  return (
    <div className="container-fluid">
      <form>
        <Help/>
        <div className="form-group d-flex flex-row">
          <textarea style={{width: "100%"}}
            value={queryStr}
            onChange={(ev) => queryChanged(ev.target.value)}
          />
          {queryStr.length > 0 ? 
            <div className="ml-1"
              data-toggle="tooltip" data-placement="bottom" title={queryError ? `Error at ${queryError.location}: ${queryError.message}` : ""}>
              {queryError ? <ErrorIcon className="text-danger"/> : <OKIcon className="text-success"/> }
            </div>
          : ""}
        </div>
        {semanticTagsList.map((st, i) => 
          <div key={i} className="form-group">
            <span>{st}: </span>
            <ac.SemanticAutocomplete onChange={suggestions => tagFilled(st, suggestions)}/>
          </div>)
        }
        <div className="form-group">
          <button type="button" className="btn btn-primary" style={{marginLeft: "10px"}}
            data-toggle="tooltip" data-placement="bottom" title="Make search"
            onClick={submitQuery}>
            <SearchIcon/> 
          </button>
        </div>
      </form>
      {searching ?
        <div className="row">
          <div className="col-sm">
            <h3>Searching...</h3>
          </div>
        </div>
      : <></>}
      <div id={alertId}></div>
    </div>
  );
}

