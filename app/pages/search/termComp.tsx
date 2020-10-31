import * as React from "react";
import type { AppContext } from "app/context";
import * as ac from "app/components/autocomplete";
import { SearchType } from "core/searchModel";
import * as icons from "app/components/icons";

interface TermCompProps {
  appContext: AppContext;
  isFirst: boolean;
  updateAnTypeHandle(sType: SearchType): void;
  updateValueHandle(value: string): void;
  updateSynonymsHandle(flag: boolean): void;
  deleteHandle?(): void;
  submitHandle(): void;
}

export type TermCompType = React.FunctionComponentElement<TermCompProps>;

export default function TermComp(props: TermCompProps): React.FunctionComponentElement<TermCompProps> {
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
        <option value={SearchType.REGEX}>All types</option>
        <option value={SearchType.SEMANTIC}>Semantic tag</option>
        <option value={SearchType.KEYWORD}>Free-text keyword</option>
        <option value={SearchType.COMMENT}>Comment</option>
      </select>
      {inputType === SearchType.SEMANTIC ?
        <>
          <ac.SemanticAutocomplete
            id="basicSearch-semantic-autocomplete"
            appContext={props.appContext}
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
          onKeyPress={(ev) => { if ((ev as any).code === "Enter") { props.submitHandle(); } }}
          onChange={ev => {
            const val: string = ev.target.value;
            setValue(val);
            props.updateValueHandle(val);
          }}/>
      }
      {props.isFirst ? <></> :
        <button type="button" className="btn btn-sm btn-danger"
          onClick={() => { if (props.deleteHandle) { props.deleteHandle(); } }}>
          <icons.DeleteIcon/>
        </button>
      }
    </div>
  );
}
