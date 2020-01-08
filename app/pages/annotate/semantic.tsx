import * as React from "react";
import { FaPlus } from "react-icons/fa";
import { Context } from "../../components/context";
import { showAlertSuccess, showAlertWarning, showAlertError } from "../../components/ui"; 
import * as ac from "../../components/autocomplete/view";
import * as api from "../../api/annotations";

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
    api.postAnnotationSemantic(uris, label, props.context)
      .then(() => showAlertSuccess(props.alertId, "Semantic annotation created"))
      .catch(error => {
        if (error.response?.data?.message) {
          showAlertWarning(props.alertId, error.response.data.message);
        } else {
          showAlertError(props.alertId, "Failed: server error");
        }
      });
  }

  function postAnnotationAsKeyword(): void {
    api.postAnnotationKeyword(label, props.context)
      .then(() => {
        showAlertSuccess(props.alertId, "Keyword annotation created");
        setLabel("");
      })
      .catch((error: any) => {
        console.error(error);
        if (error?.response?.data?.message) {
          showAlertWarning(props.alertId, error.response.data.message);
        } else {
          showAlertError(props.alertId, "Failed: server error");
        }
      });
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
      <div className="d-flex flex-row" style={{margin: "10px"}}>
        <ac.SemanticAutocomplete 
          ref={(comp) => setRef(comp)} 
          allowNew={true}
          onChange={gotSuggestion}
        />
        <button type="button" className="btn btn-primary"
          disabled={label.length === 0}
          onClick={() => {
            annotate();
            if (ref) { ref.clear(); }
          }}
        ><FaPlus/></button>
      </div>
      { isNew ? renderKeywordDialog() : <></>}
    </>
  );
}
