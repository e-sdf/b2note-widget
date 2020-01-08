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
  const [ref, setRef] = React.useState(null as any);

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    if (suggestions.length > 0) {
      //console.log(suggestions);
      setLabel(suggestions[0].labelOrig);
      setUris(suggestions[0].items.map(i => i.uris));
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

  return (
    <div className="d-flex flex-row" style={{margin: "10px"}}>
      <ac.SemanticAutocomplete 
        ref={(comp) => setRef(comp)} 
        onChange={gotSuggestion}
      />
      <button type="button" className="btn btn-primary"
        disabled={label.length === 0}
        onClick={() => {
          annotate();
          if (ref) {
            ref.clear();
          }
        }}
      ><FaPlus/></button>
    </div>
  );
}
