import * as React from "react";
import * as icons from "../components/icons";
import type { Context } from "../context";
import * as context from "../context";
import * as anModel from "../core/annotationsModel";
import * as anApi from "../api/annotations";
import TagEditor from "./tagEditor";

interface AnViewProps {
  context: Context;
  annotation: anModel.Annotation;
  updateHandler(newBody: anModel.AnBody): void;
  deleteHandler(): void;
}

export default function AnView(props: AnViewProps): React.FunctionComponentElement<AnViewProps> { 
  const [pendingDelete, setPendingDelete] = React.useState(false);
  const [edited, setEdited] = React.useState(false);
  const annotation = props.annotation;
  const target = annotation.target;
  const thisFile = target.source === props.context.mbTarget?.source;
  const mbUser = props.context.mbUser;
  const mbUserPID = context.loggedUserPID(props.context);

  function renderDeleteConfirmation(): React.ReactElement {
    return (
      <tr>
        <td colSpan={3} className="alert alert-danger condensed">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-sm font-italic">Really delete the annotation?</div>
            </div>
            <div className="row justify-content-center mt-2">
              <button type="button" 
                className="btn btn-sm btn-danger mr-3"
                style={{marginLeft: "5px", marginRight: "5px"}}
                onClick={() => {
                  if (pendingDelete && mbUser) {
                    props.deleteHandler();
                  }
                }}>
                Yes
              </button>
              <button type="button"
                className="btn btn-sm btn-success ml-3"
                style={{marginLeft: "5px"}}
                onClick={() => setPendingDelete(false)}>
                No
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  function renderFile(): React.ReactElement {
    return (
      <span 
        data-toggle="tooltip" data-placement="bottom" title={target.source + (thisFile ? " (this file)" : " (other file)")}>
        {thisFile 
          ? <icons.FileThis className="text-secondary"/>
          : <icons.FileOther className="text-secondary"/>}
      </span>
    );
  }

  function renderOwner(): React.ReactElement {
    return (
      mbUserPID
        ? anModel.isMine(annotation, mbUserPID)
          ? <icons.MineIcon className="text-secondary"
            data-toggle="tooltip" data-placement="bottom" title="My annotation"/>
          : <icons.OthersIcon className="text-secondary"
            data-toggle="tooltip" data-placement="bottom" title="Other's annotation"/>
        : <></>
    );
  }

  function renderTargetActions(): React.ReactElement {
    return (
      <>
        <button type="button" className="btn btn-sm btn-outline-primary list-action-button"
          data-toggle="tooltip" data-placement="bottom" title="Visit landing page"
          onClick={() => window.open(target.id, "_blank")}>
          <icons.LookIcon/>
        </button>
        <button type="button" className="btn btn-sm btn-outline-primary list-action-button"
          data-toggle="tooltip" data-placement="bottom" title="Download file"
          onClick={() => window.open(target.source, "_blank")}>
          <icons.DownloadIcon/>
        </button>
      </>
    );
  }

  function renderActionButtons(): React.ReactElement {
    return (
      <>
        <button type="button"
          className="btn btn-sm btn-outline-primary list-action-button mr-1"
          data-toggle="tooltip" data-placement="bottom" title="Edit this tag"
          onClick={() => setEdited(true)}>
          <icons.EditIcon/>
        </button>
        <button type="button"
          className="btn btn-sm btn-outline-primary list-action-button"
          data-toggle="tooltip" data-placement="bottom" title="Delete this tag"
          onClick={() => setPendingDelete(true)}>
          <icons.DeleteIcon/>
        </button>
      </>
    );
  }

  function renderView(): React.ReactElement {
    return (
      <tr>
        <td style={tds}>
          {renderFile()}
          <span> </span>
          {renderOwner()}
        </td>
        <td style={tds}>
          {renderTargetActions()}
        </td>
        <td style={tds}>
          {anModel.isMine(annotation, mbUserPID) ? renderActionButtons() : <></>}
        </td>
      </tr>
    );
  }

  const tds = { "border": 0, "paddingTop": 0 };
  return (
    pendingDelete ? 
      renderDeleteConfirmation()
    : edited ?
      <TagEditor
        annotation={annotation}
        cancelledHandler={() => setEdited(false)}
        updateHandler={(newBody) => { setEdited(false); props.updateHandler(newBody); }}/>
    : renderView()
  );
}


