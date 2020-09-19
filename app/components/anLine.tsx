import * as React from "react";
import * as icons from "./icons";
import { loggedUserPID } from "../context";
import type { ApiComponent } from "./defs";
import * as anModel from "core/annotationsModel";
import * as anApi from "../api/annotations";
import VisibilitySwitcher from "../components/visibilitySwitcher";
import AnTagEditor from "./anTagEditor";
import SpinningWheel from "../components/spinningWheel";
import Alert from "./alert";
import { ActionEnum, anNotify } from "app/notify";

interface Props extends ApiComponent {
  annotation: anModel.Annotation;
  anChangedHandler?: (newAn: anModel.Annotation) => void;
  anDeletedHandler?: () => void;
}

export default function AnLine(props: Props): React.FunctionComponentElement<Props> {
  const [pendingDelete, setPendingDelete] = React.useState(false);
  const [edited, setEdited] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const annotation = props.annotation;
  const target = annotation.target;
  const thisId = target.id === props.context.mbTarget?.pid;
  const thisSource = target.source === props.context.mbTarget?.source;
  const mbUser = props.context.mbUser;
  const mbUserPID = loggedUserPID(props.context);
  const actionBtnStyle = "btn btn-sm btn-outline-primary";

  function updateAn(newBody: anModel.AnBody): void {
    if (mbUser) {
      setLoading(true);
      anApi.patchAnnotationBody(mbUser, props.annotation.id, newBody, props.authErrAction).then(
        (newAn) => {
          setLoading(false);
          anNotify(props.context.config, ActionEnum.EDIT, newAn);
          if (props.anChangedHandler) { props.anChangedHandler(newAn); }
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function updateVisibility(visibility: anModel.VisibilityEnum): void {
    if (mbUser) {
      setLoading(true);
      anApi.changeAnVisibility(mbUser, props.annotation.id, visibility, props.authErrAction).then(
         (newAn: anModel.Annotation) => {
          setLoading(false);
          anNotify(props.context.config, ActionEnum.EDIT, newAn);
          if (props.anChangedHandler) { props.anChangedHandler(newAn); }
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function deleteAn(): void {
    if (mbUser) {
      setLoading(true);
      anApi.deleteAnnotation(mbUser, props.annotation.id, props.authErrAction).then(
        () => {
          setLoading(false);
          setPendingDelete(false);
          anNotify(props.context.config, ActionEnum.DELETE, props.annotation);
          if (props.anDeletedHandler) { props.anDeletedHandler(); }
        },
        (err) => { setLoading(false); setPendingDelete(false); setErrorMessage(err); }
      );
    }
  }

  function renderDeleteConfirmation(): React.ReactElement {
    return (
      <div className="alert alert-danger condensed">
        <div className="d-flex flex-row justify-content-center">
          <div className="font-italic">Really delete the annotation?</div>
        </div>
        <div className="d-flex flex-row justify-content-center mt-2">
          <button type="button"
            className="btn btn-sm btn-danger mr-3"
            style={{marginLeft: "5px", marginRight: "5px"}}
            onClick={() => {
              if (pendingDelete) {
                deleteAn();
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
    );
  }

  function renderTarget(): React.ReactElement {
    function renderTargetPart(part: "PID"|"Source"|"Selection", url?: string, thisPart?: boolean): React.ReactElement {
      return (
        <div>
          {thisPart ?
            <span className="badge badge-info"
              data-toggle="tooltip" data-placement="bottom" title={"Currently annotated Target " + part}>
              {part}
            </span>
          :
            <a href="#"
              onClick={() => { if (part === "Selection") { window.alert("Not yet implemented"); } else { window.open(url, "_blank"); }}}>
              <span className="badge badge-info"
                data-toggle="tooltip" data-placement="bottom" title={part === "Selection" ? "Show selection" : "Open Target " + part + " URL"}>
                <icons.ArrowRightIcon/> {part}
              </span>
            </a>
          }
        </div>
      );
    }

    return (
      <div>
        {renderTargetPart("PID", target.id, thisId)}
        {target.source ? renderTargetPart("Source", target.source, thisSource) : <></>}
        {target.selector ? renderTargetPart("Selection") : <></>}
      </div>
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

  const padded = { padding: "0 5px"};

  function renderAnActions(): React.ReactElement {
    return (
      <>
        <div style={padded}>
          <VisibilitySwitcher
            text={false}
            small={true}
            visibility={annotation.visibility}
            setVisibility={updateVisibility}/>
        </div>
        <div className="btn-group" style={padded}>
          <button type="button"
            className={actionBtnStyle}
            data-toggle="tooltip" data-placement="bottom" title="Edit label of this annotation"
            onClick={() => setEdited(true)}>
            <icons.EditIcon/>
          </button>
          <button type="button"
            className={actionBtnStyle}
            data-toggle="tooltip" data-placement="bottom" title="Delete this annotation"
            onClick={() => setPendingDelete(true)}>
            <icons.DeleteIcon/>
          </button>
        </div>
      </>
    );
  }

  function renderView(): React.ReactElement {
    return (
      <div className="d-flex flex-row">
        <div style={{...padded, marginRight: "10px"}}>
          {renderTarget()}
        </div>
        <div style={padded}>
          {renderOwner()}
        </div>
        {anModel.isMine(annotation, mbUserPID) ? renderAnActions() : <></>}
      </div>
    );
  }

  return (
    <div className="mr-2">
      {pendingDelete ?
        renderDeleteConfirmation()
      : edited ?
        <div style={{marginLeft: "5px"}}>
          <AnTagEditor
            solrUrl={props.context.config.solrUrl}
            annotation={annotation}
            cancelledHandler={() => setEdited(false)}
            updateHandler={(newBody) => { setEdited(false); updateAn(newBody); }}/>
        </div>
      : renderView()}
      <div className="row mt-2 justify-content-center">
        <SpinningWheel show={loading}/>
        <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
      </div>
    </div>
  );
}
