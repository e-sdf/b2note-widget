import * as React from "react";
import { Context } from "../../context";
import { showAlertSuccess, showAlertError } from "../../components/ui"; 
import * as api from "../../api/annotations";
import { CommentIcon, CreateIcon } from "../../components/icons";

export interface CommentProps {
  context: Context;
  alertId: string;
}

export function Comment(props: CommentProps): React.FunctionComponentElement<CommentProps> {
  const [comment, setComment] = React.useState("");

  function annotate(): void {
    api.postAnnotationComment(comment, props.context).then(
      () => {
        showAlertSuccess(props.alertId, "Comment created");
        setComment("");
      },
      (err) => showAlertError(props.alertId, err)
    );
  }

  return (
    <div className="d-flex flex-row align-items-center" style={{margin: "10px"}}>
      <CommentIcon className="mr-1"/>
      <textarea className="form-control"
        value={comment}
        onChange={ev => setComment(ev.target?.value || "")} 
      />
      <button type="button" className="btn btn-primary"
        data-toggle="tooltip" data-placement="bottom" title={props.context.user ? "" : "Not logged in"}
        disabled={comment.length === 0 || !props.context.user}
        onClick={annotate}
      ><CreateIcon/></button>
    </div>
  );
}

