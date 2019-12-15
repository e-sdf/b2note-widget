import * as _ from "lodash";
import * as React from "react";
import * as icons from "react-icons/fa";
import { AnRecord } from "../../shared/annotationsModel";
import { Context } from "../../widget/context";
import { SearchType, Sexpr } from "../../shared/searchModel";
import * as ac from "../../autocomplete/autocomplete";
import { SemanticAutocomplete } from "../../autocomplete/view";
import * as api from "../../api/annotations";

const AddIcon = icons.FaPlus;
const SearchIcon = icons.FaSearch;
const DeleteIcon = icons.FaTrashAlt;

interface TermCompProps {
  isFirst: boolean;
  updateAnTypeHandle(sType: SearchType): void;
  updateLabelHandle(label: string): void;
  deleteHandle?(): void;
}

type TermComp = React.FunctionComponentElement<TermCompProps>;

function TermComp(props: TermCompProps): TermComp {
  const [inputType, setInputType] = React.useState(SearchType.REGEX);
  const [label, setLabel] = React.useState("");
  const [includeSynonyms, setIncludeSynonyms] = React.useState(false);

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    const val = suggestions[0].labelOrig;
    setLabel(val);
    props.updateLabelHandle(val);
  }

  return (
    <div className="form-group">
      <select className="form-control"
        value={inputType}
        onChange={(ev) => {
          const val = ev.target.value as SearchType;
          setInputType(val);
          props.updateAnTypeHandle(val);
          if (val === SearchType.SEMANTIC) {
            setLabel("");
            props.updateLabelHandle("");
          }
        }}>
        <option value={SearchType.REGEX}>Any (regular expression)</option>
        <option value={SearchType.SEMANTIC}>Semantic tag</option>
        <option value={SearchType.KEYWORD}>Free-text keyword</option>
        <option value={SearchType.COMMENT}>Comment</option>
      </select>
      {inputType === SearchType.SEMANTIC ? 
        <>
          <SemanticAutocomplete onChange={gotSuggestion}/>
          <div className="form-group">
            <div className="form-check">
              <input className="form-check-input" type="checkbox"
                checked={includeSynonyms} 
                onChange={ev => setIncludeSynonyms(ev.target.checked)}
              />
              <label className="form-check-label">
                Include synonym matches
              </label>
            </div>
          </div>
        </>
        : <input type="text" className="form-control"
          value={label} 
          onChange={ev => {
            const val: string = ev.target.value;
            setLabel(val);
            props.updateLabelHandle(val);
          }}/>
      }
      {props.isFirst ? "" :
        <button type="button" className="btn btn-sm btn-danger"
          onClick={() => { if (props.deleteHandle) { props.deleteHandle(); } }}>
          <DeleteIcon/>
        </button>
      }
    </div>
  );
}

interface TermItem {
  id: number;
  sType: SearchType;
  label: string;
  termComp: TermComp;
}

enum TermsActionType { 
  ADD = "ADD",
  UPDATE_STYPE = "UPDATE_STYPE",
  UPDATE_LABEL = "UPDATE_LABEL",
  DELETE = "DELETE"
}

function mkTermId(): number {
  return Date.now();
}

function mkTermItem(id: number, isFirst: boolean, dispatch: React.Dispatch<TermsAction>): TermItem {
  return {
    id,
    sType: SearchType.SEMANTIC,
    label: "",
    termComp: <TermComp 
      key={id}
      isFirst={isFirst} 
      updateAnTypeHandle={(sType: SearchType): void => dispatch({ type: TermsActionType.UPDATE_STYPE, termId: id, sType })}
      updateLabelHandle={(label: string): void => dispatch({ type: TermsActionType.UPDATE_LABEL, termId: id, label })}
      deleteHandle={() => dispatch({ type: TermsActionType.DELETE, termId: id })}/>
  };
}

interface TermsAction {
  type: TermsActionType;
  termId: number;
  newTerm?: TermItem;
  sType?: SearchType;
  label?: string;
}

function reducer(terms: Array<TermItem>, action: TermsAction): Array<TermItem> {
  const res: Array<TermItem> = (
     action.type === TermsActionType.ADD ?
       _.concat(terms, action.newTerm ? action.newTerm : [])
     : action.type === TermsActionType.UPDATE_STYPE ?
       terms.map(t => t.id === action.termId ? { ...t, sType: action.sType ? action.sType : t.sType } : t) 
     : action.type === TermsActionType.UPDATE_LABEL ?
       terms.map(t => t.id === action.termId ? { ...t, label: action.label ? action.label : t.label } : t) 
     : action.type === TermsActionType.DELETE ?
       terms.filter(t => t.id !== action.termId)
     : (() => { console.error("Unknown term action"); return terms; })()
   );
   return res;
}

export interface BasicSearchProps {
  context: Context;
  resultsHandle(results: Array<AnRecord>): void;
}

enum SearchMode { ANY = "any", ALL = "all" }

export function BasicSearch(props: BasicSearchProps): React.FunctionComponentElement<BasicSearchProps> {
  const [terms, dispatch] = React.useReducer(reducer, [] as Array<TermItem>);
  const [mode, setMode] = React.useState(SearchMode.ANY);

  React.useEffect(() => {
    const firstTerm = mkTermItem(0, true, dispatch);
    dispatch({ type: TermsActionType.ADD, termId: firstTerm.id, newTerm: firstTerm });
  }, []);

  function addTerm(): void {
    const termId = mkTermId();
    const newTerm = mkTermItem(termId, false, dispatch);
    dispatch({ 
      type: TermsActionType.ADD,
      termId,
      newTerm
    });
  }

  function submitQuery(): void {
    //const sTerms: Array<SearchTerm> = terms.map(t => ({
      //operator: t.operator,
      //type: t.sType,
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

  function renderModeSelection(): React.ReactElement {
    return(
      <div className="form-group">
        <div className="custom-control custom-radio custom-control-inline">
          <input type="radio" id="customRadioInline1" name="modeRadio" className="custom-control-input"
            checked={mode === SearchMode.ANY}
            onChange={() => setMode(SearchMode.ANY)}/>
          <label className="custom-control-label" htmlFor="customRadioInline1">Match any</label>
        </div>
        <div className="custom-control custom-radio custom-control-inline">
          <input type="radio" id="customRadioInline2" name="modeRadio" className="custom-control-input"
            checked={mode === SearchMode.ALL}
            onChange={() => setMode(SearchMode.ALL)}/>
          <label className="custom-control-label" htmlFor="customRadioInline2">Match all</label>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid search-panel">
      <form>
        {terms.map((term: TermItem) => term.termComp)}
        {terms.length > 1 ? renderModeSelection() : ""}
        <div className="form-group">
          <button type="button" className="btn btn-secondary"
            data-toggle="tooltip" data-placement="bottom" title="Add another expression"
            onClick={addTerm}>
            <AddIcon/> 
          </button>
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
