import _ from "lodash";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import type { AppContext } from "app/context";
import * as icons from "app/components/icons";
import type { Annotation } from "core/annotationsModel";
import type { SearchQuery } from "core/apiModels/anQueryModel";
import { SearchType, BiOperatorType } from "core/searchModel";
import * as queryParser from "core/searchQueryParser";
import * as api from "app/api/annotations";
import type { TermCompType } from "./termComp";
import TermComp from "./termComp";
import SpinningWheel from "app/components/spinningWheel";
import Alert from "app/components/alert";

interface TermItem {
  id: number;
  sType: SearchType;
  value: string;
  includeSynonyms: boolean; //Relevant just for SEMANTIC
  termComp: TermCompType;
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
  appContext: AppContext;
  resultsHandle(results: Array<Annotation>): void;
}

enum SearchMode { ANY = "any", ALL = "all" }

export function BasicSearch(props: BasicSearchProps): React.FunctionComponentElement<BasicSearchProps> {
  const [terms, dispatch] = React.useReducer(reducer, [] as Array<TermItem>);
  const [nonEmptyTerms, setNonEmptyTerms] = React.useState([] as Array<TermItem>);
  const [mode, setMode] = React.useState(SearchMode.ANY);
  const [searching, setSearching] = React.useState(false);
  const [submitRequest, setSubmitRequest] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);

  React.useEffect(() => {
    const firstTerm = mkTermItem(0, true, dispatch, submitQuery);
    dispatch({ type: TermsActionType.ADD, termId: firstTerm.id, newTerm: firstTerm });
  }, []);

  React.useEffect(() => {
    setNonEmptyTerms(terms.filter(t => t.value.length > 0));
  }, [terms]);

  React.useEffect(
    () => {
      if (submitRequest) {
        if (nonEmptyTerms.length > 0) {submitQuery();}
        setSubmitRequest(false);
      }
    },
    [submitRequest]
  );

  // React.useEffect(() => console.log(nonEmptyTerms), [nonEmptyTerms]);

  function mkTermItem(id: number, isFirst: boolean, dispatch: React.Dispatch<TermsAction>, submitFn: () => void): TermItem {
    return {
      id,
      sType: SearchType.REGEX,
      value: "",
      includeSynonyms: false,
      termComp:
        <TermComp
          appContext={props.appContext}
          key={id}
          isFirst={isFirst}
          updateAnTypeHandle={(sType: SearchType): void => dispatch({ type: TermsActionType.UPDATE_STYPE, termId: id, sType })}
          updateValueHandle={(value: string): void => dispatch({ type: TermsActionType.UPDATE_VALUE, termId: id, value })}
          updateSynonymsHandle={(flag: boolean): void => dispatch({ type: TermsActionType.UPDATE_SYNONYMS_FLAG, termId: id, includeSynonyms: flag })}
          deleteHandle={() => dispatch({ type: TermsActionType.DELETE, termId: id })}
          submitHandle={() => setSubmitRequest(true)}/>
    };
  }

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
      (anl: Array<Annotation>) => {
        setSearching(false);
        props.resultsHandle(anl);
      },
      err => { setSearching(false); setErrorMessage(err); }
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
    <div className="container-fluid mt-2" style={{width: "90%"}}>
      {terms.map((term: TermItem) => term.termComp)}
      {terms.length > 1 ? renderModeSelection() : <></>}
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
        <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
      </div>
    </div>
  );
}
