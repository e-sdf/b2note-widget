import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import { TypeFilter } from "../../shared/annotationsModel";
import { OperatorType, SearchTerm, SearchQuery } from "../../shared/searchModel";
import * as ac from "../../autocomplete/autocomplete";
import { SemanticAutocomplete } from "../../autocomplete/view";
import * as api from "../../api/annotations";
import { showAlertWarning, showAlertError } from "../../components"; 

const AddIcon = icons.FaPlus;
const SearchIcon = icons.FaSearch;
const DeleteIcon = icons.FaTrashAlt;

const alertId = "searchAlert";

interface TermCompProps {
  isFirst: boolean;
  updateOperatorHandle(operator: OperatorType): void;
  updateAnTypeHandle(anType: TypeFilter): void;
  updateLabelHandle(label: string): void;
  deleteHandle?(): void;
}

type OperatorComp = React.FunctionComponentElement<{}>;

type TermComp = React.FunctionComponentElement<TermCompProps>;

function TermComp(props: TermCompProps): TermComp {
  const [operator, setOperator] = React.useState(OperatorType.AND);
  const [inputType, setInputType] = React.useState(TypeFilter.SEMANTIC);
  const [label, setLabel] = React.useState("");

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    const val = suggestions[0].labelOrig;
    setLabel(val);
    props.updateLabelHandle(val);
  }

  function renderOperator(): React.ReactElement {
    return (
      <select className="form-control"
        value={operator}
        onChange={(ev) => {
          const val = ev.target.value as OperatorType;
          setOperator(val);
          props.updateOperatorHandle(val);
        }}>
        {Object.keys(OperatorType).map(opKey => {
          const op: OperatorType = OperatorType[opKey as OperatorType];
          return <option key={op} value={op}>{op}</option>;
        })}
      </select>
    );
  }

  return (
    <div className="form-group">
      {props.isFirst ? "" : renderOperator()}
      <select className="form-control"
        value={inputType}
        onChange={(ev) => {
          const val = ev.target.value as TypeFilter;
          setInputType(val);
          props.updateAnTypeHandle(val);
          if (val === TypeFilter.SEMANTIC) {
            setLabel("");
            props.updateLabelHandle("");
          }
        }}>
        <option value={TypeFilter.SEMANTIC}>Semantic tag</option>
        <option value={TypeFilter.KEYWORD}>Free-text keyword</option>
        <option value={TypeFilter.COMMENT}>Comment</option>
      </select>
      {inputType === TypeFilter.SEMANTIC ? 
        <SemanticAutocomplete 
          onChange={gotSuggestion}
        />
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
  operator?: OperatorType;
  anType: TypeFilter;
  label: string;
  termComp: TermComp;
}

enum TermsActionType { 
  ADD = "ADD",
  UPDATE_OPERATOR = "UPDATE_OPERATOR",
  UPDATE_ANTYPE = "UPDATE_ANTYPE",
  UPDATE_LABEL = "UPDATE_LABEL",
  DELETE = "DELETE"
}

function mkTermId(): number {
  return Date.now();
}

function mkTermItem(id: number, isFirst: boolean, dispatch: React.Dispatch<TermsAction>): TermItem {
  return {
    id,
    operator: isFirst ? undefined : OperatorType.AND,
    anType: TypeFilter.SEMANTIC,
    label: "",
    termComp: <TermComp 
      key={id}
      isFirst={isFirst} 
      updateOperatorHandle={(operator: OperatorType): void => dispatch({ type: TermsActionType.UPDATE_OPERATOR, termId: id, operator })}
      updateAnTypeHandle={(anType: TypeFilter): void => dispatch({ type: TermsActionType.UPDATE_ANTYPE, termId: id, anType })}
      updateLabelHandle={(label: string): void => dispatch({ type: TermsActionType.UPDATE_LABEL, termId: id, label })}
      deleteHandle={() => dispatch({ type: TermsActionType.DELETE, termId: id })}/>
  };
}

interface TermsAction {
  type: TermsActionType;
  termId: number;
  newTerm?: TermItem;
  operator?: OperatorType;
  anType?: TypeFilter;
  label?: string;
}

function reducer(terms: Array<TermItem>, action: TermsAction): Array<TermItem> {
  const res: Array<TermItem> = (
     action.type === TermsActionType.ADD ?
       _.concat(terms, action.newTerm ? action.newTerm : [])
     : action.type === TermsActionType.UPDATE_OPERATOR ?
       terms.map(t => t.id === action.termId ? { ...t, operator: action.operator ? action.operator : t.operator } : t) 
     : action.type === TermsActionType.UPDATE_ANTYPE ?
       terms.map(t => t.id === action.termId ? { ...t, anType: action.anType ? action.anType : t.anType } : t) 
     : action.type === TermsActionType.UPDATE_LABEL ?
       terms.map(t => t.id === action.termId ? { ...t, label: action.label ? action.label : t.label } : t) 
     : action.type === TermsActionType.DELETE ?
       terms.filter(t => t.id !== action.termId)
     : (() => { console.error("Unknown term action"); return terms; })()
   );
   return res;
}


export function SearchPage(): React.FunctionComponentElement<{}> {
  const [terms, dispatch] = React.useReducer(reducer, [] as Array<TermItem>);
  const [includeSynonyms, setIncludeSynonyms] = React.useState(false);

  React.useEffect(() => {
    const firstTerm = mkTermItem(0, true, dispatch);
    dispatch({ type: TermsActionType.ADD, termId: firstTerm.id, newTerm: firstTerm });
  }, []);

  function submitQuery(): void {
    const sTerms: Array<SearchTerm> = terms.map(t => ({
      operator: t.operator,
      type: t.anType,
      label: t.label
    }));
    const expr: SearchQuery = {
      terms: sTerms,
      includeSynonyms: includeSynonyms
    };
    api.searchAnnotations(expr)
    .then((files) => {
      console.log(files);
    })
    .catch(error => {
      if (error.response.data && error.response.data.message) {
        showAlertWarning(alertId, error.response.data.message);
      } else {
        showAlertError(alertId, "Failed: server error");
      }
    });
  }

  return (
    <div className="container-fluid search-panel">
      <form>
        {terms.map((term: TermItem) => term.termComp)}
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
        <div className="form-group">
          <button type="button" className="btn btn-secondary"
            data-toggle="tooltip" data-placement="bottom" title="Add another expression"
            onClick={() => {
              const termId = mkTermId();
              const newTerm = mkTermItem(termId, false, dispatch);
              dispatch({ 
                type: TermsActionType.ADD,
                termId,
                newTerm
              });
            }
            }>
            <AddIcon/> 
          </button>
          <button type="button" className="btn btn-primary" style={{marginLeft: "10px"}}
            data-toggle="tooltip" data-placement="bottom" title="Make search"
            onClick={submitQuery}>
            <SearchIcon/> 
          </button>
        </div>
        <div className="row mt-2">
          <div className="col-sm">
            <div id={alertId}></div>
          </div>
        </div>
      </form>
    </div>
  );
}

export function render(): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<SearchPage/>, container);
  } else {
    console.error("#page element missing");
  }
}

