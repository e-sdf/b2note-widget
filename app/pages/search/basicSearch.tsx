import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import { Context } from "../../widget/context";
import { Tabs, Tab } from "../../components";
import * as anModel from "../../shared/annotationsModel";
import * as ac from "../../autocomplete/autocomplete";
import { SemanticAutocomplete } from "../../autocomplete/view";
import * as api from "../../api/annotations";
import { showAlertWarning, showAlertError } from "../../components"; 

const OKIcon = icons.FaCheck;
const ErrorIcon = icons.FaExclamation;
const SearchIcon = icons.FaSearch;

const alertId = "basic-search-alert";

export interface BasicSearchProps {
  context: Context;
  resultsHandle(results: Array<anModel.AnRecord>): void;
}

export function BasicSearch(props: BasicSearchProps): React.FunctionComponentElement<BasicSearchProps> {
  enum SearchType { SEMANTIC = "semantic", KEYWORD = "keyword", COMMENT = "comment", ANY = "any" };
  const [inputType, setInputType] = React.useState(SearchType.SEMANTIC);
  const [label, setLabel] = React.useState("");
  const [includeSynonyms, setIncludeSynonyms] = React.useState(false);

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    const val = suggestions[0].labelOrig;
    setLabel(val);
  }

  function submitQuery(): void {
    const filters: api.Filters = { 
      allFiles: true,
      creator: {
        mine: true,
        others: true
      },
      type: {
        semantic: inputType === SearchType.SEMANTIC,
        keyword: inputType === SearchType.KEYWORD,
        comment: inputType === SearchType.COMMENT,
      },
      value: label
    };
    api.getAnnotations(props.context, filters).then(
      annotations => {
        console.log(annotations);
        props.resultsHandle(annotations);
      }
    );
  }

  return (
    <div className="container-fluid">
      <form>
        <div className="form-group">
          <select className="form-control"
            value={inputType}
            onChange={(ev) => {
              const val = ev.target.value as SearchType;
              setInputType(val);
              if (val === SearchType.SEMANTIC) {
                setLabel("");
              }
            }}>
            <option value={SearchType.SEMANTIC}>Semantic tag</option>
            <option value={SearchType.KEYWORD}>Free-text keyword</option>
            <option value={SearchType.COMMENT}>Comment</option>
            <option value={SearchType.ANY}>Any (regular expression)</option>
          </select>
          {inputType === SearchType.SEMANTIC ? 
            <SemanticAutocomplete 
              onChange={gotSuggestion}
            />
          : <input type="text" className="form-control"
              value={label} 
              onChange={ev => {
                const val: string = ev.target.value;
                setLabel(val);
              }}/>
          }
        </div>
        {inputType === SearchType.SEMANTIC ?
          <div className="form-group form-check">
            <input className="form-check-input" type="checkbox"
              checked={includeSynonyms} 
              onChange={ev => setIncludeSynonyms(ev.target.checked)}
            />
            <label className="form-check-label">
              Include synonym matches
            </label>
          </div>
        : ""}
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
