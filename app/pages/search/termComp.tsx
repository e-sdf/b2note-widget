import * as React from "react";
import * as icons from "../../components/icons";
import * as ac from "../../components/autocomplete/view";
import { SearchType } from "../../core/searchModel";

interface TermCompProps {
  updateAnTypeHandle(sType: SearchType): void;
  updateValueHandle(value: string): void;
  updateSynonymsHandle(flag: boolean): void;
}

export function TermComp(props: TermCompProps): React.FunctionComponentElement<TermCompProps> {
  const [inputType, setInputType] = React.useState(SearchType.REGEX);
  const [value, setValue] = React.useState("");
  const [includeSynonyms, setIncludeSynonyms] = React.useState(false);

  function gotSuggestion(suggestions: ac.Suggestion[]): void {
    const val = suggestions[0]?.labelOrig || "";
    props.updateValueHandle(val);
  }

  return (
    <div>
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
        <option value={SearchType.REGEX}>Any (regular expression)</option>
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
          <div className="form-check mt-2">
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
    </div>
  );
}
