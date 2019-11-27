import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import { SemanticIcon, KeywordIcon, CommentIcon } from "../icons";
import { TypeFilter } from "../../shared/annotationsModel";
import * as ac from "../../autocomplete/autocomplete";
import { SemanticAutocomplete } from "../../autocomplete/view";

const AddIcon = icons.FaPlus;
const SearchIcon = icons.FaSearch;

type SemanticInputComp = React.FunctionComponentElement<{}>;
type KeywordInputComp = React.FunctionComponentElement<{}>;
type CommentInputComp = React.FunctionComponentElement<{}>;
type InputComp = SemanticInputComp | KeywordInputComp | CommentInputComp;

type SearchItemComp = React.FunctionComponentElement<{}>;

function SearchItem(): SearchItemComp {
  const [inputType, setInputType] = React.useState(TypeFilter.SEMANTIC);
  const [ref, setRef] = React.useState(null as any);
  const [label, setLabel] = React.useState("");

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    setLabel(suggestions[0].labelOrig);
  }

  return (
        <div className="form-group">
          <select className="form-control"
            value={inputType}
            onChange={(ev) => {
              const val = ev.target.value;
              setInputType(val as TypeFilter);
              if (val === TypeFilter.SEMANTIC) { setLabel(""); }
            }}>
            <option value={TypeFilter.SEMANTIC}>Semantic tag</option>
            <option value={TypeFilter.KEYWORD}>Free-text keyword</option>
            <option value={TypeFilter.COMMENT}>Comment</option>
          </select>
          {inputType === TypeFilter.SEMANTIC ? 
            <SemanticAutocomplete 
              ref={(comp) => setRef(comp)} 
              onChange={gotSuggestion}
            />
          : <input type="text" className="form-control"
              value={label} 
              onChange={ev => setLabel(ev.target.value)}
            />
          }
        </div>
  );
}

enum OperationType { AND = "AND", OR = "OR", NOT = "NOT", XOR = "XOR" }

type OperationComp = React.FunctionComponentElement<{}>;

function Operation(): OperationComp {
  const [operation, setOperation] = React.useState(OperationType.AND);
  return (
    <select className="form-control"
      value={operation}
      onChange={(ev) => setOperation(ev.target.value as OperationType)}>
      {Object.keys(OperationType).map(opKey => {
        const op: OperationType = OperationType[opKey as OperationType];
        return <option key={op} value={op}>{op}</option>;
      })}
    </select>
  );
}

interface Field {
  sOperation?: OperationComp;
  sItemComp: SearchItemComp;
}

export function SearchPage(): React.FunctionComponentElement<{}> {
  const firstField: Field = {
    sItemComp: <SearchItem/>
  };
  const [fields, setFields] = React.useState([firstField] as Array<Field>);
  const [includeSynonyms, setIncludeSynonyms] = React.useState(false);

  function addField(): void {
    const newField: Field = {
      sOperation: <Operation/>,
      sItemComp: <SearchItem/>
    };
    setFields(_.concat(fields, newField));
  }

  return (
    <div className="container-fluid search-panel">
      <form>
        {fields.map((field, i) =>
          <div key={i}>
            {field.sOperation}
            {field.sItemComp}
          </div>
        )}
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
            onClick={() => addField()}>
            <AddIcon/> 
          </button>
          <button type="button" className="btn btn-primary" style={{marginLeft: "10px"}}
            data-toggle="tooltip" data-placement="bottom" title="Make search">
            <SearchIcon/> 
          </button>
        </div>
      </form>
    </div>
  );
}

export function render() {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<SearchPage/>, container);
  } else {
    console.error("#page element missing");
  }
}

