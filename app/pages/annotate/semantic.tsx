import * as React from "react";
import type { ApiComponent } from "../../components/defs";
import SpinningWheel from "../../components/spinningWheel";
import Alert from "../../components/alert"; 
import VisibilitySwitcher from "../../components/visibilitySwitcher";
import * as anModel from "../../core/annotationsModel";
import * as ac from "../../components/autocomplete/view";
import * as api from "../../api/annotations";
import { SemanticIcon, CreateIcon } from "../../components/icons";
import { ActionEnum, notify } from "../../components/notify";

export function Semantic(props: ApiComponent): React.FunctionComponentElement<ApiComponent> {
  const [uris, setUris] = React.useState([] as Array<string>);
  const [label, setLabel] = React.useState("");
  const [visibility, setVisibility] = React.useState(anModel.VisibilityEnum.PRIVATE);
  const [successMessage, setSuccessMessage] = React.useState(null as string|null);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const [isNew, setIsNew] = React.useState(false);
  const [ref, setRef] = React.useState(null as any);
  const [loading, setLoading] = React.useState(false);
  const target = props.context.mbTarget;
  const user = props.context.mbUser;

  React.useEffect(() => setErrorMessage(null), [successMessage]);
  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);

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

  function postAnnotationAsSemantic(): void {
    if (target && user) {
      setLoading(true);
      api.postAnnotationSemantic({ target, user, uris, label, visibility, authErrAction: props.authErrAction }).then(
        newAn => { 
          setLoading(false);
          setSuccessMessage("Sematic annotation created");
          notify(ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function postAnnotationAsKeyword(): void {
    if (target && user) {
      api.postAnnotationKeyword({ target, user, label, visibility, authErrAction: props.authErrAction }).then(
        newAn => {
          setSuccessMessage("Keyword annotation created");
          setLabel("");
          notify(ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
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
          data-toggle="tooltip" data-placement="bottom" title={props.context.mbUser ? "" : "Not logged in"}
          disabled={label.length === 0 || !props.context.mbUser || loading}
          onClick={() => {
            postAnnotationAsSemantic();
            if (ref) { ref.clear(); }
          }}
        ><CreateIcon/></button>
      </div>
      <div className="d-flex flex-row justify-content-center mt-2">
        <VisibilitySwitcher text={true} visibility={visibility} setVisibility={setVisibility}/>
      </div>
      <div className="d-flex flex-row justify-content-center mt-2">
        <SpinningWheel show={loading}/>
        <Alert type="success" message={successMessage} closedHandler={() => setSuccessMessage(null)}/>
        <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
      </div>
      { isNew ? renderKeywordDialog() : <></>}
    </>
  );
}
