import * as React from "react";
import type { PageProps } from "../pages";
import { showAlertSuccess, showAlertError, SpinningWheel } from "../../components/ui"; 
import * as oreg from "../../core/ontologyRegister";
import { solrUrl } from "../../config";
import * as api from "../../api/annotations";
import { KeywordIcon, CreateIcon } from "../../components/icons";

export interface KeywordProps extends PageProps {
  alertId: string;
}

export function Keyword(props: KeywordProps): React.FunctionComponentElement<KeywordProps> {
  const [label, setLabel] = React.useState("");
  const [uris, setUris] = React.useState([] as Array<string>);
  const [loading, setLoading] = React.useState(false);
  const [semanticFound, setSemanticFound] = React.useState(false);
  const [tooLong, setTooLong] = React.useState(false);
  const lengthLimit = 60;
  const target = props.context.mbTarget;
  const user = props.context.mbUser;

  React.useEffect(() => setTooLong(label.length > lengthLimit), [label]);

  function postAnnotation(): void {
    if (target && user) {
      api.postAnnotationKeyword(target, user, label, props.authErrAction).then(
        () => {
          showAlertSuccess(props.alertId, "Keyword annotation created");
          setLabel("");
        },
        (err) => showAlertError(props.alertId, err)
      );
    }
  }

  function postAnnotationAsSemantic(): void {
    if (target && user) {
      api.postAnnotationSemantic(target, user, uris, label, props.authErrAction).then(
        () => {
          showAlertSuccess(props.alertId, "Semantic annotation created");
          setLabel("");
        },
        (err) => showAlertError(props.alertId, err)
      );
    }
  }

  function postAnnotationAsComment(): void {
    if (target && user) {
      api.postAnnotationComment(target, user, label, props.authErrAction).then(
        () => {
          showAlertSuccess(props.alertId, "Comment annotation created");
          setLabel("");
        },
        (err) => showAlertError(props.alertId, err)
      );
    }
  }

  function annotate(): void {
    // Check the existence of a semantic tag
    setLoading(true);
    oreg.getOntologies(solrUrl, label).then(oDict => {
      setLoading(false);
      if (oDict[label]) {
        setUris(oDict[label].map(i => i.uris));
        setSemanticFound(true);
      } else {
        postAnnotation();
      }
    });
  }

  function renderSemantisationDialog(): React.ReactElement {
    return (
      <div style={{ margin: "15px" }}>
        <p>
          We found semantic terms matching the keyword.
          </p>
        <p>
          Would you like to select one or carry on with free-text?
          </p>
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
              postAnnotation();
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
            onClick={() => postAnnotation()}>
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
      <div className="d-flex flex-row justify-content-center">
        <SpinningWheel show={loading}/>
      </div>
      {tooLong ?
        renderTooLongSubmitVersion()
      : <></>
      }
      {semanticFound ? renderSemantisationDialog() : <></>}
    </>
  );
}
