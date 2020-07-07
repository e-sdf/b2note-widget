import * as React from "react";
import type { ApiComponent } from "../../components/defs";
import Alert from "../../components/alert"; 
import SpinningWheel from "../../components/spinningWheel";
import VisibilitySwitcher from "../../components/visibilitySwitcher";
import * as anModel from "../../core/annotationsModel";
import * as oreg from "../../core/ontologyRegister";
import config from "../../config";
import * as api from "../../api/annotations";
import { KeywordIcon, CreateIcon } from "../../components/icons";
import { ActionEnum, notify } from "../../components/notify";

export function Keyword(props: ApiComponent): React.FunctionComponentElement<ApiComponent> {
  const [label, setLabel] = React.useState("");
  const [uris, setUris] = React.useState([] as Array<string>);
  const [visibility, setVisibility] = React.useState(anModel.VisibilityEnum.PRIVATE);
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState(null as string|null);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const [semanticFound, setSemanticFound] = React.useState(false);
  const [tooLong, setTooLong] = React.useState(false);
  const lengthLimit = 60;
  const target = props.context.mbTarget;
  const user = props.context.mbUser;

  React.useEffect(() => setErrorMessage(null), [successMessage]);
  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);
  React.useEffect(() => setTooLong(label.length > lengthLimit), [label]);

  function postAnnotationAsKeyword(): void {
    if (target && user) {
      setLoading(true);
      api.postAnnotationKeyword({ target, user, label, visibility, authErrAction: props.authErrAction }).then(
        newAn => {
          setLoading(false);
          setSuccessMessage("Keyword annotation created");
          setLabel("");
          notify(ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function postAnnotationAsSemantic(): void {
    if (target && user) {
      setLoading(true);
      api.postAnnotationSemantic({ target, user, uris, label, visibility, authErrAction: props.authErrAction }).then(
        newAn => {
          setSuccessMessage("Sematic annotation created");
          setLabel("");
          notify(ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function postAnnotationAsComment(): void {
    if (target && user) {
      setLoading(true);
      api.postAnnotationComment({ target, user, comment: label, visibility, authErrAction: props.authErrAction }).then(
        newAn => {
          setSuccessMessage("Comment annotation created");
          setLabel("");
          notify(ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function annotate(): void {
    // Check the existence of a semantic tag
    setLoading(true);
    oreg.getOntologies(config.solrUrl, label).then(oDict => {
      setLoading(false);
      if (oDict[label]) {
        setUris(oDict[label].map(i => i.uris));
        setSemanticFound(true);
      } else {
        postAnnotationAsKeyword();
      }
    });
  }

  function renderSemantisationDialog(): React.ReactElement {
    return (
      <div style={{ margin: "5px 15px 0 15px" }}>
        <div style={{fontSize: "85%"}}>
          <p>
            Found semantic terms matching the keyword.
          </p>
          <p>
            Would you like to select one or carry on with free-text?
          </p>
        </div>
        <div className="d-flex flex-row justify-content-between" style={{ margin: "10px" }}>
          <button type="button" className="btn btn-primary"
            onClick={() => {
              setSemanticFound(false);
              postAnnotationAsSemantic();
            }}>
            Semantic
          </button>
          <button type="button" className="btn btn-secondary"
            onClick={() => {
              setSemanticFound(false);
              postAnnotationAsKeyword();
            }}>
            Keyword
            </button>
          <button type="button" className="btn btn-warning"
            onClick={() => setSemanticFound(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function renderTooLongSubmitVersion(): React.ReactElement {
    return (
      <div style={{ margin: "15px" }}>
        <p>
          This text seems long for a keyword (&gt;{lengthLimit} characters).
        </p>
        <p>
          Do you want to use it as:  
        </p>
        <div className="d-flex flex-row justify-content-between" style={{ margin: "10px" }}>
          <button type="button" className="btn btn-primary"
            onClick={() => postAnnotationAsComment()}>
            Comment
          </button>
          <button type="button" className="btn btn-secondary"
            onClick={() => postAnnotationAsKeyword()}>
            Keyword
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-row align-items-center" style={{margin: "10px"}}>
        <KeywordIcon className="mr-1"/>
        <input className="form-control"
          value={label}
          onChange={ev => setLabel(ev.target?.value || "")} 
        />
        {tooLong ? 
          <></>
        : <button type="button" className="btn btn-primary"
            data-toggle="tooltip" data-placement="bottom" title={props.context.mbUser ? "" : "Not logged in"}
            disabled={label.length === 0 || !props.context.mbUser || loading}
            onClick={annotate}>
            <CreateIcon/>
          </button>
        }
      </div>
      <div className="d-flex flex-row justify-content-center mt-2">
        <VisibilitySwitcher text={true} visibility={visibility} setVisibility={setVisibility}/>
      </div>
      <div className="d-flex flex-row justify-content-center mt-2">
        <SpinningWheel show={loading}/>
        <Alert type="success" message={successMessage} closedHandler={() => setSuccessMessage(null)}/>
        <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
      </div>
      {tooLong ?
        renderTooLongSubmitVersion()
      : <></>
      }
      {semanticFound ? renderSemantisationDialog() : <></>}
    </>
  );
}
