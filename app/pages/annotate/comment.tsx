import * as React from "react";
import type { ApiComponent } from "client/components/defs";
import Alert from "client/components/alert";
import SpinningWheel from "client/components/spinningWheel";
import VisibilitySwitcher from "client/components/visibilitySwitcher";
import * as anModel from "core/annotationsModel";
import * as api from "client/api/annotations";
import { CommentIcon, CreateIcon } from "client/components/icons";
import { ActionEnum, anNotify } from "client/notify";

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
      api.postAnnotationComment(props.context.config, { target, user, comment, visibility, authErrAction: props.authErrAction }).then(
        newAn => {
          setLoading(false);
          setSuccessMessage("Comment annotation created");
          setComment("");
          anNotify(props.context.config, ActionEnum.CREATE, newAn);
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
          data-toggle="tooltip" data-placement="bottom" title={props.context.mbUser ? "Create annotation" : "Not logged in"}
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
