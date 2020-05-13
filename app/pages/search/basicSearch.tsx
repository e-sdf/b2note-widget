import _ from "lodash";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import * as icons from "../../components/icons";
import type { AnRecord, SearchQuery } from "../../core/annotationsModel";
import * as ac from "../../components/autocomplete/view";
import { SearchType, BiOperatorType } from "../../core/searchModel";
import * as queryParser from "../../core/searchQueryParser";
import * as api from "../../api/annotations";
import { showAlertError, SpinningWheel } from "../../components/ui"; 

const alertId = "basic-search-alert";

interface TermCompProps {
  isFirst: boolean;
  updateAnTypeHandle(sType: SearchType): void;
  updateValueHandle(value: string): void;
  updateSynonymsHandle(flag: boolean): void;
  deleteHandle?(): void;
  submitHandle(): void;
}

type TermComp = React.FunctionComponentElement<TermCompProps>;

function TermComp(props: TermCompProps): TermComp {
  const [inputType, setInputType] = React.useState(SearchType.REGEX);
  const [value, setValue] = React.useState("");
  const [includeSynonyms, setIncludeSynonyms] = React.useState(false);

  function gotSuggestion(suggestions: ac.Suggestion[]): void {
    const val = suggestions[0]?.labelOrig || "";
    props.updateValueHandle(val);
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
            setValue("");
            props.updateValueHandle("");
          }
        }}>
        <option value={SearchType.REGEX}>All types (regular expression)</option>
        <option value={SearchType.SEMANTIC}>Semantic tag</option>
        <option value={SearchType.KEYWORD}>Free-text keyword</option>
        <option value={SearchType.COMMENT}>Comment</option>
      </select>
      {inputType === SearchType.SEMANTIC ? 
        <>
          <ac.SemanticAutocomplete 
            id="basicSearch-semantic-autocomplete"
            onChange={gotSuggestion}
           />
          <div className="form-group">
            <div className="form-check">
              <input className="form-check-input" type="checkbox"
                checked={includeSynonyms} 
                onChange={ev => {
                  const val = ev.target.checked;
                  setIncludeSynonyms(val);
                  props.updateSynonymsHandle(val);
                }}
              />
              <label className="form-check-label">
                Include synonym matches
              </label>
            </div>
          </div>
        </>
        : <input type="text" className="form-control"
          value={value} 
          // onKeyPress={(ev) => { if (ev.charCode == 13) { props.submitHandle(); } }}
          onChange={ev => {
            const val: string = ev.target.value;
            setValue(val);
            props.updateValueHandle(val);
          }}/>
      }
      {props.isFirst ? "" :
        <button type="button" className="btn btn-sm btn-danger"
          onClick={() => { if (props.deleteHandle) { props.deleteHandle(); } }}>
          <icons.DeleteIcon/>
        </button>
      }
    </div>
  );
}

interface TermItem {
  id: number;
  sType: SearchType;
  value: string;
  includeSynonyms: boolean; //Relevant just for SEMANTIC
  termComp: TermComp;
}

enum TermsActionType { 
  ADD = "ADD",
  UPDATE_STYPE = "UPDATE_STYPE",
  UPDATE_VALUE = "UPDATE_VALUE",
  UPDATE_SYNONYMS_FLAG = "UPDATE_SYNONYMS_FLAG",
  DELETE = "DELETE"
}

function mkTermId(): number {
  return Date.now();
}

function mkTermItem(id: number, isFirst: boolean, dispatch: React.Dispatch<TermsAction>, submitFn: () => void): TermItem {
  return {
    id,
    sType: SearchType.REGEX,
    value: "",
    includeSynonyms: false,
    termComp: <TermComp 
      key={id}
      isFirst={isFirst} 
      updateAnTypeHandle={(sType: SearchType): void => dispatch({ type: TermsActionType.UPDATE_STYPE, termId: id, sType })}
      updateValueHandle={(value: string): void => dispatch({ type: TermsActionType.UPDATE_VALUE, termId: id, value })}
      updateSynonymsHandle={(flag: boolean): void => dispatch({ type: TermsActionType.UPDATE_SYNONYMS_FLAG, termId: id, includeSynonyms: flag })}
      deleteHandle={() => dispatch({ type: TermsActionType.DELETE, termId: id })}
      submitHandle={submitFn}/>
  };
}

interface TermsActionBase {
  type: TermsActionType;
  termId: number;
}

interface AddTermAction extends TermsActionBase {
  newTerm: TermItem;
}

interface UpdateStypeTermAction extends TermsActionBase {
  sType: SearchType;
}

interface UpdateValueTermAction extends TermsActionBase {
  value: string;
}

interface UpdateSynonymsFlagTermAction extends TermsActionBase {
  includeSynonyms: boolean;
}

type DeleteTermAction = TermsActionBase

type TermsAction = AddTermAction | UpdateStypeTermAction | UpdateValueTermAction | UpdateSynonymsFlagTermAction | DeleteTermAction

function reducer(terms: Array<TermItem>, action: TermsAction): Array<TermItem> {
  return matchSwitch(action.type, {
    [TermsActionType.ADD]: () => [ ...terms, (action as AddTermAction).newTerm ],
    [TermsActionType.UPDATE_STYPE]: () => terms.map(t => t.id === action.termId ? { ...t, sType: (action as UpdateStypeTermAction).sType } : t),
    [TermsActionType.UPDATE_VALUE]: () => terms.map(t => t.id === action.termId ? { ...t, value: (action as UpdateValueTermAction).value } : t), 
    [TermsActionType.UPDATE_SYNONYMS_FLAG]: () => terms.map(t => t.id === action.termId ? { ...t, includeSynonyms: (action as UpdateSynonymsFlagTermAction).includeSynonyms } : t),
    [TermsActionType.DELETE]: () => terms.filter(t => t.id !== action.termId)
  });
}

export interface BasicSearchProps {
  resultsHandle(results: Array<AnRecord>): void;
}

enum SearchMode { ANY = "any", ALL = "all" }

export function BasicSearch(props: BasicSearchProps): React.FunctionComponentElement<BasicSearchProps> {
  const [searching, setSearching] = React.useState(false);
  const [terms, dispatch] = React.useReducer(reducer, [] as Array<TermItem>);
  const [nonEmptyTerms, setNonEmptyTerms] = React.useState([] as Array<TermItem>);
  const [mode, setMode] = React.useState(SearchMode.ANY);

  React.useEffect(() => {
    const firstTerm = mkTermItem(0, true, dispatch, submitQuery);
    dispatch({ type: TermsActionType.ADD, termId: firstTerm.id, newTerm: firstTerm });
  }, []);

  React.useEffect(() => {
    setNonEmptyTerms(terms.filter(t => t.value.length > 0)); 
  }, [terms]);

  //const nonEmptyTerms: () => Array<TermItem> = () => terms.filter(t => t.value.length > 1);

  function addTerm(): void {
    const termId = mkTermId();
    const newTerm = mkTermItem(termId, false, dispatch, submitQuery);
    dispatch({ 
      type: TermsActionType.ADD,
      termId,
      newTerm
    });
  }

  function mkValue(term: TermItem): string {
    const delim = term.sType === SearchType.REGEX ? "/" : '"';
    const synonyms = term.sType === SearchType.SEMANTIC && term.includeSynonyms ? "+s" : "";
    return `${queryParser.type2marker(term.sType)}:${delim}${term.value}${delim}${synonyms}`;
  }

  function mkExpression(operator: BiOperatorType, terms: Array<TermItem> ): string {
    return (
      terms.length > 2 ?
        `${mkValue(terms[0])} ${operator} ${mkExpression(operator, _.tail(terms))}`
      : `${mkValue(terms[0])} ${operator} ${mkValue(terms[1])}`
    );
  }

  function submitQuery(): void {
    const operator = mode === SearchMode.ANY ? BiOperatorType.OR : BiOperatorType.AND;
    const query: SearchQuery = 
      nonEmptyTerms.length > 1 ? mkExpression(operator, nonEmptyTerms) : mkValue(nonEmptyTerms[0]);
    setSearching(true);
    api.searchAnnotations(query).then(
      (anl: Array<AnRecord>) => {
        setSearching(false);
        props.resultsHandle(anl);
      },
      (err) => {
        setSearching(false);
        showAlertError(alertId, err);
      }
    );
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
    <div className="container-fluid mt-2">
      {terms.map((term: TermItem) => term.termComp)}
      {terms.length > 1 ? renderModeSelection() : ""}
      <div className="form-group">
        <button type="button" className="btn btn-secondary"
          data-toggle="tooltip" data-placement="bottom" title="Add another expression"
          onClick={addTerm}>
          <icons.AddIcon/> 
        </button>
        <button type="button" className="btn btn-primary" style={{marginLeft: "10px"}}
          data-toggle="tooltip" data-placement="bottom" title="Make search"
          disabled={nonEmptyTerms.length === 0}
          onClick={submitQuery}>
          <icons.SearchIcon/> 
        </button>
      </div>
      <div className="row justify-content-center">
        <SpinningWheel show={searching}/>
      </div>
      <div id={alertId}></div>
    </div>
  );
}

