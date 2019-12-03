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
const DeleteIcon = icons.FaTrashAlt;

interface TermCompProps {
  isFirst: boolean;
  deleteHandle(): void;
}

enum OperatorType { AND = "AND", OR = "OR", AND_NOT = "AND_NOT", XOR = "XOR" }

type OperatorComp = React.FunctionComponentElement<{}>;

type TermComp = React.FunctionComponentElement<TermCompProps>;

function TermComp(props: TermCompProps): TermComp {
  const [operation, setOperation] = React.useState(OperatorType.AND);
  const [inputType, setInputType] = React.useState(TypeFilter.SEMANTIC);
  const [label, setLabel] = React.useState("");

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    setLabel(suggestions[0].labelOrig);
  }

  function renderOperation(): React.ReactElement {
    return (
      <select className="form-control"
        value={operation}
        onChange={(ev) => setOperation(ev.target.value as OperatorType)}>
        {Object.keys(OperatorType).map(opKey => {
          const op: OperatorType = OperatorType[opKey as OperatorType];
          return <option key={op} value={op}>{op}</option>;
        })}
      </select>
    );
  }

  return (
    <div className="form-group">
      {props.isFirst ? "" : renderOperation()}
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
          onChange={gotSuggestion}
        />
        : <input type="text" className="form-control"
          value={label} 
          onChange={ev => setLabel(ev.target.value)}
        />
      }
      {props.isFirst ? "" :
        <button type="button" className="btn btn-sm btn-danger"
          onClick={() => props.deleteHandle()}>
          <DeleteIcon/>
        </button>
      }
    </div>
  );
}

interface ExpressionItem {
  operation?: OperatorType;
  type: TypeFilter;
  label: string;
}

type Expression = Array<ExpressionItem>;

//function fieldsToExpression(fields: Array<Field>): Expression {
  //return fields.map(field => ({
    //operation: field.operationComp.
  //});
//}

interface TermItem {
  id: number;
  termComp: TermComp;
}

export function SearchPage(): React.FunctionComponentElement<{}> {

  function mkTermItem(isFirst: boolean): TermItem {
    const id = Date.now();
    return {
      id,
      termComp: <TermComp isFirst={isFirst} deleteHandle={() => deleteTerm(id)}/>
    };
  }

  const firstTerm = mkTermItem(true);
  const [terms, setTerms] = React.useState([firstTerm] as Array<TermItem>);
  const [includeSynonyms, setIncludeSynonyms] = React.useState(false);

  function addTerm(): void {
    const newTerm = mkTermItem(false);
    setTerms(_.concat(terms, newTerm));
  }

  function deleteTerm(id: number): void {
    console.log(id);
    console.log(terms);
    const newTerms = terms.filter(t => {console.log (t.id !== id); return t.id !== id;});
    setTerms(newTerms);
  }

  React.useEffect(() => {
    console.log(terms);
  }, [terms]);

  return (
    <div className="container-fluid search-panel">
      <form>
        {terms.map((term, i) =>
          <React.Fragment key={i}>
            {term.termComp}
          </React.Fragment>
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
            onClick={() => addTerm()}>
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

