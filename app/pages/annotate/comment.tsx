import * as React from "react";
import type { SysContext, AppContext } from "app/context";
import Alert from "app/components/alert";
import SpinningWheel from "app/components/spinningWheel";
import VisibilitySwitcher from "app/components/visibilitySwitcher";
import * as anModel from "core/annotationsModel";
import * as api from "app/api/annotations";
import { CommentIcon, CreateIcon } from "app/components/icons";
import { ActionEnum, anNotify } from "app/notify";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
}

export default function Comment(props: Props): React.FunctionComponentElement<Props> {
  const [comment, setComment] = React.useState("");
  const [visibility, setVisibility] = React.useState(anModel.VisibilityEnum.PRIVATE);
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState(null as string|null);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const config = props.sysContext.config;
  const mbTarget = props.sysContext.mbTarget;
  const mbUser = props.appContext.mbUser;
  const authErrAction = props.appContext.authErrAction;

  React.useEffect(() => setErrorMessage(null), [successMessage]);
  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);

  function annotate(): void {
    if (mbTarget && mbUser) {
      setLoading(true);
      api.postAnnotationComment(config, { target: mbTarget, user: mbUser, comment, visibility, authErrAction }).then(
        newAn => {
          setLoading(false);
          setSuccessMessage("Comment annotation created");
          setComment("");
          anNotify(props.sysContext.config, ActionEnum.CREATE, newAn);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function renderInput(): React.ReactElement {
    return (
      <div className="d-flex flex-row align-items-center" style={{margin: "10px"}}>
        <CommentIcon className="mr-1"/>
        <textarea className="form-control"
          value={comment}
          rows={5}
          onChange={ev => setComment(ev.target?.value || "")}
          onKeyDown={ev => {if (ev.key === "Enter" && comment.length > 0) {annotate();}}}
        />
      </div>
    );
  }

  function renderActionRow(): React.ReactElement {
    const disabled = comment.length === 0 || !mbUser || loading;

    return (
      <div className="d-flex flex-row justify-content-end mt-2" style={{margin: "10px 10px 10px 30px"}}>
        <VisibilitySwitcher text={true} visibility={visibility} setVisibility={setVisibility}/>
        <button type="button" className="btn btn-primary ml-4"
          data-toggle="tooltip" data-placement="bottom" title={mbUser ? "Create comment annotation" : "Not logged in"}
          disabled={disabled}
          onClick={annotate}>
          <CreateIcon/>
        </button>
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
    </>
  );
}
