import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import * as anModel from "../../shared/annotationsModel";
import * as ac from "../../autocomplete/autocomplete";
import { SemanticAutocomplete } from "../../autocomplete/view";
import * as api from "../../api/annotations";
import { showAlertWarning, showAlertError } from "../../components"; 
import * as queryParser from "./queryParser";

const OKIcon = icons.FaCheck;
const ErrorIcon = icons.FaExclamation;
const SearchIcon = icons.FaSearch;

const alertId = "advanced-search-alert";

export interface AdvancedSearchProps {
  resultsHandle(results: Array<anModel.AnRecord>): void;
}

export function AdvancedSearch(props: AdvancedSearchProps): React.FunctionComponentElement<AdvancedSearchProps> {
  const [queryStr, setQueryStr] = React.useState("");
  const [queryError, setQueryError] = React.useState(null as queryParser.ParseError|null);
  const [semanticTagsList, setSemanticTagsList] = React.useState([] as Array<string>);
  const [semanticTagsDict, setSemanticTagsDict] = React.useState({});

  function queryChanged(query: string): void {
    setQueryStr(query);
    const res = queryParser.parse(query);
    setQueryError(res.error ? res.error : null);
    const tags = query.match(/s:[a-zA-Z0-9]+/g)?.map(m => m.substring(2, m.length));
    setSemanticTagsList(!res.error && tags ? tags : []);
  }
  
  function tagFilled(tag: string, suggestions: Array<ac.Suggestion>): void {
    const value = suggestions[0].labelOrig;
    setSemanticTagsDict({ ...semanticTagsDict, [tag]: value });
  }

  React.useEffect(() => console.log(semanticTagsDict), [semanticTagsDict]);

  function submitQuery(): void {
    //const sTerms: Array<SearchTerm> = terms.map(t => ({
      //operator: t.operator,
      //type: t.anType,
      //label: t.label
    //}));
    //const expr: SearchQuery = {
      //terms: sTerms,
      //includeSynonyms: includeSynonyms
    //};
    //api.searchAnnotations(expr)
    //.then((files) => {
      //console.log(files);
    //})
    //.catch(error => {
      //if (error.response.data && error.response.data.message) {
        //showAlertWarning(alertId, error.response.data.message);
      //} else {
        //showAlertError(alertId, "Failed: server error");
      //}
    //});
  }

  function Help(): React.FunctionComponentElement<{}> {
    return (
      <p className="query-syntax-text text-secondary">
        Example query:<br/>
        <span style={{fontFamily: "monospace"}}>s:semantic1 AND (k:keyword1 OR c:&quot;comment words&quot;)</span><br/>
        Binary operators: <span style={{fontFamily: "monospace"}}>AND</span>, <span style={{fontFamily: "monospace"}}>OR</span>, <span style={{fontFamily: "monospace"}}>XOR</span><br/>
        Unary operator: <span style={{fontFamily: "monospace"}}>NOT</span>
      </p>
    );
  }

  return (
    <div className="container-fluid search-panel">
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
            <SemanticAutocomplete onChange={suggestions => tagFilled(st, suggestions)}/>
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
    </div>
  );
}

