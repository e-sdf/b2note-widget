import * as React from "react";
import { FaPlus } from "react-icons/fa";
import { Context } from "../../components/context";
import { showAlertSuccess, showAlertWarning, showAlertError } from "../../components/ui"; 
import * as api from "../../api/annotations";

export interface CommentProps {
  context: Context;
  alertId: string;
}

export function Comment(props: CommentProps): React.FunctionComponentElement<CommentProps> {
  const [comment, setComment] = React.useState("");

  function annotate(): void {
    api.postAnnotationComment(comment, props.context)
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
    <div className="d-flex flex-row" style={{margin: "10px"}}>
      <textarea className="form-control"
        value={comment}
        onChange={ev => setComment(ev.target?.value || "")} 
      />
      <button type="button" className="btn btn-primary"
        disabled={comment.length === 0}
        onClick={annotate}
      ><FaPlus/></button>
    </div>
  );
}

