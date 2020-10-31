import * as React from "react";
import type { SysContext, AppContext } from "app/context";
import Alert from "app/components/alert";
import SpinningWheel from "app/components/spinningWheel";
import VisibilitySwitcher from "app/components/visibilitySwitcher";
import * as anModel from "core/annotationsModel";
import * as oreg from "app/api/ontologyRegister";
import * as api from "app/api/annotations";
import { KeywordIcon, CreateIcon } from "app/components/icons";
import { ActionEnum, anNotify } from "app/notify";

export interface Props {
  sysContext: SysContext;
  appContext: AppContext;
}

export default function Keyword(props: Props): React.FunctionComponentElement<Props> {
  const [value, setValue] = React.useState("");
  const [uris, setUris] = React.useState([] as Array<string>);
  const [visibility, setVisibility] = React.useState(anModel.VisibilityEnum.PRIVATE);
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState(null as string|null);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const [semanticFound, setSemanticFound] = React.useState(false);
  const [tooLong, setTooLong] = React.useState(false);
  const lengthLimit = 60;
  const config = props.sysContext.config;
  const mbTarget = props.sysContext.mbTarget;
  const mbUser = props.appContext.mbUser;
  const authErrAction = props.appContext.authErrAction;

  React.useEffect(() => setErrorMessage(null), [successMessage]);
  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);
  React.useEffect(() => setTooLong(value.length > lengthLimit), [value]);

  function postAnnotationAsKeyword(): void {
    if (mbTarget && mbUser) {
      setLoading(true);
      api.postAnnotationKeyword(config, { target: mbTarget, user: mbUser, value, visibility, authErrAction }).then(
        newAn => {
          setLoading(false);
          setSuccessMessage("Keyword annotation created");
          setValue("");
          anNotify(config, ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function postAnnotationAsSemantic(): void {
    if (mbTarget && mbUser) {
      setLoading(true);
      api.postAnnotationSemantic(props.sysContext.config, { target: mbTarget, user: mbUser, uris, value, visibility, authErrAction }).then(
        newAn => {
          setSuccessMessage("Sematic annotation created");
          setValue("");
          anNotify(props.sysContext.config, ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function postAnnotationAsComment(): void {
    if (mbTarget && mbUser) {
      setLoading(true);
      api.postAnnotationComment(props.sysContext.config, { target: mbTarget, user: mbUser, comment: value, visibility, authErrAction }).then(
        newAn => {
          setSuccessMessage("Comment annotation created");
          setValue("");
          anNotify(props.sysContext.config, ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function annotate(): void {
    // Check the existence of a semantic tag
    setLoading(true);
    oreg.findOTerms(props.appContext, value).then(oDict => {
      setLoading(false);
      if (oDict[value]) {
        setUris(oDict[value].map(i => i.uris));
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

  function renderInput(): React.ReactElement {
    return (
      <div className="d-flex flex-row align-items-center" style={{margin: "10px"}}>
        <KeywordIcon className="mr-1"/>
        <input className="form-control"
          value={value}
          onChange={ev => setValue(ev.target?.value || "")}
          onKeyDown={ev => {if (ev.key === "Enter" && value.length > 0) {annotate();}}}
        />
      </div>
    );
  }

  function renderActionRow(): React.ReactElement {
    const disabled = value.length === 0 || !mbUser || loading;

    return (
      <>
        <div className="d-flex flex-row justify-content-end mt-2" style={{margin: "10px 10px 10px 30px"}}>
          <VisibilitySwitcher text={true} visibility={visibility} setVisibility={setVisibility}/>
          {tooLong ?
            <></>
          : <button type="button" className="btn btn-primary ml-4"
              data-toggle="tooltip" data-placement="bottom" title={mbUser ? "Create keyword annotation" : "Not logged in"}
              disabled={disabled}
              onClick={annotate}>
              <CreateIcon/>
            </button>
          }
        </div>
      </>
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
      {tooLong ?
        renderTooLongSubmitVersion()
      : <></>
      }
      {semanticFound ? renderSemantisationDialog() : <></>}
    </>
  );
}
