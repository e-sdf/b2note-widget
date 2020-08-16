import * as React from "react";
import type { ApiComponent } from "client/components/defs";
import SpinningWheel from "client/components/spinningWheel";
import Alert from "client/components/alert";
import VisibilitySwitcher from "client/components/visibilitySwitcher";
import type { OntologyInfoRequest } from "client/components/ontologyInfoPanel";
import * as anModel from "core/annotationsModel";
import * as ac from "client/components/autocomplete";
import * as api from "client/api/annotations";
import * as icons from "client/components/icons";
import { ActionEnum, anNotify } from "client/notify";

interface Props extends ApiComponent {
  suggestion: ac.Suggestion|null;
  setSuggestionHandler(suggestion: ac.Suggestion|null): void;
  showInfoHandler(oir: OntologyInfoRequest): void;
}

export function Semantic(props: Props): React.FunctionComponentElement<Props> {
  const [suggestion, setSuggestion] = React.useState(props.suggestion);
  const [uris, setUris] = React.useState([] as Array<string>);
  const [label, setLabel] = React.useState("");
  const [visibility, setVisibility] = React.useState(anModel.VisibilityEnum.PRIVATE);
  const [successMessage, setSuccessMessage] = React.useState(null as string|null);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const [isNew, setIsNew] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const target = props.context.mbTarget;
  const user = props.context.mbUser;

  const inputRef = React.useRef(null as any);

  React.useEffect(() => setErrorMessage(null), [successMessage]);
  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);

  React.useEffect(() => {
    if (suggestion) {
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
  }, [suggestion]);

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    if (suggestions.length > 0) {
      const s = suggestions[0];
      setSuggestion(s);
      props.setSuggestionHandler(s);
    }
  }

  function postAnnotationAsSemantic(): void {
    if (target && user) {
      setLoading(true);
      api.postAnnotationSemantic(props.context.config, { target, user, uris, label, visibility, authErrAction: props.authErrAction }).then(
        newAn => {
          setLoading(false);
          setSuccessMessage("Sematic annotation created");
          anNotify(props.context.config, ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function postAnnotationAsKeyword(): void {
    if (target && user) {
      api.postAnnotationKeyword(props.context.config, { target, user, label, visibility, authErrAction: props.authErrAction }).then(
        newAn => {
          setSuccessMessage("Keyword annotation created");
          setSuggestion(null);
          anNotify(props.context.config, ActionEnum.CREATE, newAn);
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
              if (inputRef?.current) { inputRef.current.clear(); }
            }}>
            Select<br/>different one
            </button>
        </div>
      </div>

    );
  }

  function renderInput(): React.ReactElement {
    return (
      <div className="d-flex flex-row align-items-center" style={{margin: "10px"}}>
        <icons.SemanticIcon className="mr-1"/>
        <div style={{width: 350}}>
          <ac.SemanticAutocomplete
            id="annotate-semantic-autocomplete"
            ref={inputRef}
            solrUrl={props.context.config.solrUrl}
            defaultInputValue={suggestion?.labelOrig || ""}
            allowNew={true}
            onChange={gotSuggestion}/>
        </div>
      </div>
    );
  }


  function renderActionRow(): React.ReactElement {
    const disabled = label.length === 0 || !props.context.mbUser || loading;

    return (
      <div className="d-flex flex-row justify-content-between" style={{margin: "10px 10px 10px 30px"}}>
        <button type="button" className="btn btn-info"
          data-toggle="tooltip" data-placement="bottom" title="Show ontology details"
          disabled={disabled}
          onClick={() => props.showInfoHandler({label, uris})}>
          <icons.HelpIcon/>
        </button>
        <div>
          <VisibilitySwitcher text={false} visibility={visibility} setVisibility={setVisibility}/>
          <button type="button" className="btn btn-primary ml-2"
            data-toggle="tooltip" data-placement="bottom" title={props.context.mbUser ? "Create annotation" : "Not logged in"}
            disabled={disabled}
            onClick={() => {
              postAnnotationAsSemantic();
              if (inputRef?.current) { inputRef.current.clear(); }
            }}>
            <icons.CreateIcon/>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderInput()}
      {renderActionRow()}
      <div className="d-flex flex-row justify-content-center mt-2">
        <SpinningWheel show={loading}/>
        <Alert type="success" message={successMessage} closedHandler={() => setSuccessMessage(null)}/>
        <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
      </div>
      { isNew ? renderKeywordDialog() : <></>}
    </>
  );
}
