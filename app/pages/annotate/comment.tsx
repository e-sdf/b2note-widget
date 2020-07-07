import * as React from "react";
import type { ApiComponent } from "../../components/defs";
import Alert from "../../components/alert"; 
import SpinningWheel from "../../components/spinningWheel";
import VisibilitySwitcher from "../../components/visibilitySwitcher";
import * as anModel from "../../core/annotationsModel";
import * as api from "../../api/annotations";
import { CommentIcon, CreateIcon } from "../../components/icons";
import { ActionEnum, notify } from "../../components/notify";

export function Comment(props: ApiComponent): React.FunctionComponentElement<ApiComponent> {
  const [comment, setComment] = React.useState("");
  const [visibility, setVisibility] = React.useState(anModel.VisibilityEnum.PRIVATE);
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState(null as string|null);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const target = props.context.mbTarget;
  const user = props.context.mbUser;

  React.useEffect(() => setErrorMessage(null), [successMessage]);
  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);

  function annotate(): void {
    if (target && user) {
      setLoading(true);
      api.postAnnotationComment({ target, user, comment, visibility, authErrAction: props.authErrAction }).then(
        newAn => {
          setLoading(false);
          setSuccessMessage("Comment annotation created");
          setComment("");
          notify(ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  return (
    <>
      <div className="d-flex flex-row align-items-center" style={{margin: "10px"}}>
        <CommentIcon className="mr-1"/>
        <textarea className="form-control"
          value={comment}
          onChange={ev => setComment(ev.target?.value || "")} 
        />
        <button type="button" className="btn btn-primary"
          data-toggle="tooltip" data-placement="bottom" title={props.context.mbUser ? "" : "Not logged in"}
          disabled={comment.length === 0 || !props.context.mbUser || loading}
          onClick={annotate}>
          <CreateIcon/>
        </button>
      </div>
      <div className="d-flex flex-row justify-content-center mt-2">
        <VisibilitySwitcher text={true} visibility={visibility} setVisibility={setVisibility}/>
      </div>
      <div className="d-flex flex-row justify-content-center mt-2">
        <SpinningWheel show={loading}/>
        <Alert type="success" message={successMessage} closedHandler={() => setSuccessMessage(null)}/>
        <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
      </div>
    </>
  );
}

