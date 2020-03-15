import * as React from "react";
import type { Context } from "../../context";
import { showAlertSuccess, showAlertError } from "../../components/ui"; 
import * as ac from "../../components/autocomplete/view";
import * as api from "../../api/annotations";
import { SemanticIcon, CreateIcon } from "../../components/icons";

export interface SemanticProps {
  context: Context;
  alertId: string;
}


export function Semantic(props: SemanticProps): React.FunctionComponentElement<SemanticProps> {
  const [uris, setUris] = React.useState([] as Array<string>);
  const [label, setLabel] = React.useState("");
  const [isNew, setIsNew] = React.useState(false);
  const [ref, setRef] = React.useState(null as any);

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    if (suggestions.length > 0) {
      const suggestion = suggestions[0];
      if (suggestion.customOption) {
        setIsNew(true);
        setLabel(suggestion.label);
      } else {
        setIsNew(false);
        setLabel(suggestion.labelOrig || "");
        setUris((suggestion.items || []).map(i => i.uris));
      }
    } else {
      setLabel("");
      setUris([]);
    }
  }

  function annotate(): void {
    api.postAnnotationSemantic(uris, label, props.context).then(
      () => showAlertSuccess(props.alertId, "Semantic annotation created"),
      (err) => showAlertError(props.alertId, err)
    );
  }

  function postAnnotationAsKeyword(): void {
    api.postAnnotationKeyword(label, props.context).then(
      () => {
        showAlertSuccess(props.alertId, "Keyword annotation created");
        setLabel("");
      },
      (err) => showAlertError(props.alertId, err)
    );
  }

  function renderKeywordDialog(): React.ReactElement {
    return (
      <div style={{ margin: "15px" }}>
        <p>
          You selected a new term that is not semantic.
          </p>
        <p>
          Would you like to select a different one or create a free-text keyword instead?
          </p>
        <div className="d-flex flex-row justify-content-between" style={{ margin: "10px" }}>
          <button type="button" className="btn btn-primary"
            onClick={() => {
              setIsNew(false);
              postAnnotationAsKeyword();
            }}>
            Create keyword
          </button>
          <button type="button" className="btn btn-warning"
            onClick={() => {
              setIsNew(false);
              if (ref) { ref.clear(); }
            }}>
            Select<br/>different one
            </button>
        </div>
      </div>

    );
  }

  return (
    <>
      <div className="d-flex flex-row align-items-center" style={{margin: "10px"}}>
      <SemanticIcon className="mr-1"/>
        <ac.SemanticAutocomplete 
          id="annotate-semantic-autocomplete"
          ref={(comp) => setRef(comp)} 
          allowNew={true}
          onChange={gotSuggestion}
        />
        <button type="button" className="btn btn-primary"
          data-toggle="tooltip" data-placement="bottom" title={props.context.user ? "" : "Not logged in"}
          disabled={label.length === 0 || !props.context.user}
          onClick={() => {
            annotate();
            if (ref) { ref.clear(); }
          }}
        ><CreateIcon/></button>
      </div>
      { isNew ? renderKeywordDialog() : <></>}
    </>
  );
}
