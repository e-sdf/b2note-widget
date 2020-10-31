import * as React from "react";
import type { SysContext, AppContext } from "app/context";
import OntologySourcesPanel from "app/components/ontologySourcesPanel";
import VisibilitySwitcher from "app/components/visibilitySwitcher";
import SpinningWheel from "app/components/spinningWheel";
import Alert from "app/components/alert";
import type { OntologyInfoRequest } from "app/components/ontologyInfoPanel";
import * as anModel from "core/annotationsModel";
import { defaultOntologySources } from "core/apiModels/ontologyQueryModel";
import * as ac from "app/components/autocomplete";
import * as api from "app/api/annotations";
import * as icons from "app/components/icons";
import { ActionEnum, anNotify } from "app/notify";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
  suggestion: ac.Suggestion|null;
  setSuggestionHandler(suggestion: ac.Suggestion|null): void;
  showInfoHandler(oir: OntologyInfoRequest): void;
}

export default function Semantic(props: Props): React.FunctionComponentElement<Props> {
  const [suggestion, setSuggestion] = React.useState(props.suggestion);
  const [uris, setUris] = React.useState([] as Array<string>);
  const [value, setValue] = React.useState("");
  const [sources, setSources] = React.useState(defaultOntologySources);
  const [visibility, setVisibility] = React.useState(anModel.VisibilityEnum.PRIVATE);
  const [successMessage, setSuccessMessage] = React.useState(null as string|null);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const [isNew, setIsNew] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const mbTarget = props.sysContext.mbTarget;
  const mbUser = props.appContext.mbUser;
  const authErrAction = props.appContext.authErrAction;

  const inputRef = React.useRef(null as any);

  React.useEffect(() => setErrorMessage(null), [successMessage]);
  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);

  React.useEffect(() => {
    if (suggestion) {
      if (suggestion.customOption) {
        setIsNew(true);
        setValue(suggestion.label);
      } else {
        setIsNew(false);
        setValue(suggestion.labelOrig || "");
        setUris((suggestion.items || []).map(i => i.uris));
      }
    } else {
      setValue("");
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
    if (mbTarget && mbUser) {
      setLoading(true);
      api.postAnnotationSemantic(props.sysContext.config, { target: mbTarget, user: mbUser, uris, value, visibility, authErrAction }).then(
        newAn => {
          setLoading(false);
          setSuccessMessage("Sematic annotation created");
          if (inputRef?.current) { inputRef.current.clear(); }
          anNotify(props.sysContext.config, ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

 function postAnnotationAsKeyword(): void {
    if (mbTarget && mbUser) {
      api.postAnnotationKeyword(props.sysContext.config, { target: mbTarget, user: mbUser, value, visibility, authErrAction }).then(
        newAn => {
          setSuccessMessage("Keyword annotation created");
          setSuggestion(null);
          anNotify(props.sysContext.config, ActionEnum.CREATE, newAn);
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
            appContext={props.appContext}
            id="annotate-semantic-autocomplete"
            sources={sources}
            ref={inputRef}
            defaultInputValue={suggestion?.labelOrig || ""}
            allowNew={true}
            onChange={gotSuggestion}
            onSubmit={postAnnotationAsSemantic}/>
        </div>
        <button type="button" className="btn btn-info ml-2"
          data-toggle="tooltip" data-placement="bottom" title="Show ontology details"
          disabled={value.length === 0 || loading}
          onClick={() => props.showInfoHandler({label: value, uris})}>
          <icons.HelpIcon/>
        </button>
      </div>
    );
  }


  function renderActionRow(): React.ReactElement {
    return (
      <div className="d-flex flex-row justify-content-end" style={{margin: "10px 10px 10px 30px"}}>
        <VisibilitySwitcher text={true} visibility={visibility} setVisibility={setVisibility}/>
        <button type="button" className="btn btn-primary ml-4"
          data-toggle="tooltip" data-placement="bottom" title={mbUser ? "Create semantic annotation" : "Not logged in"}
          disabled={value.length === 0 || !mbUser || loading}
          onClick={postAnnotationAsSemantic}>
          <icons.CreateIcon />
        </button>
      </div>
    );
  }

  return (
    <>
      {renderInput()}
      <div className="ml-2 mr-2">
        <OntologySourcesPanel sysContext={props.sysContext} appContext={props.appContext}
          sourcesSelectedHandler={setSources}/>
      </div>
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
