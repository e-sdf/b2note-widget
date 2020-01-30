import * as React from "react";
import { FaPlus } from "react-icons/fa";
import { Context } from "../../context";
import { showAlertSuccess, showAlertWarning, showAlertError } from "../../components/ui"; 
import * as api from "../../api/annotations";
import { CommentIcon } from "../../components/icons";

export interface CommentProps {
  context: Context;
  alertId: string;
}

export function Comment(props: CommentProps): React.FunctionComponentElement<CommentProps> {
  const [comment, setComment] = React.useState("");

  function annotate(): void {
    api.postAnnotationComment(comment, props.context.user)
    .then(() => {
      showAlertSuccess(props.alertId, "Comment created");
      setComment("");
    })
      .catch(error => {
        if (error.response.data?.message) {
          showAlertWarning(props.alertId, error.response.data.message);
        } else {
          showAlertError(props.alertId, "Failed: server error");
        }
      });
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
      ><FaPlus/></button>
    </div>
  );
}

