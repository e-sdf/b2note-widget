import * as React from "react";
import type { SysContext, AppContext } from "app/context";
import * as icons from "./icons";
import { loggedUserPID } from "app/context";
import * as anModel from "core/annotationsModel";
import * as anApi from "../api/annotations";
import AnTagView from "./anTagView";
import VisibilitySwitcher from "./visibilitySwitcher";
import SpinningWheel from "./spinningWheel";
import Alert from "./alert";
import { ActionEnum, anNotify } from "app/notify";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
  annotation: anModel.Annotation;
  anChangedHandler?: (newAn: anModel.Annotation) => void;
  anDeletedHandler?: () => void;
}

export default function AnView(props: Props): React.FunctionComponentElement<Props> {
  const [pendingDelete, setPendingDelete] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const annotation = props.annotation;
  const target = annotation.target;
  const thisId = target.id === props.sysContext.mbTarget?.pid;
  const thisSource = target.source === props.sysContext.mbTarget?.source;
  const mbUser = props.appContext.mbUser;
  const mbUserPID = loggedUserPID(props.sysContext, props.appContext);
  const actionBtnStyle = "btn btn-sm btn-outline-primary";

  function updateVisibility(visibility: anModel.VisibilityEnum): void {
    if (mbUser) {
      setLoading(true);
      anApi.changeAnVisibility(mbUser, props.annotation.id, visibility, props.appContext.authErrAction).then(
         (newAn: anModel.Annotation) => {
          setLoading(false);
          anNotify(props.sysContext.config, ActionEnum.EDIT, newAn);
          if (props.anChangedHandler) { props.anChangedHandler(newAn); }
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function deleteAn(): void {
    if (mbUser) {
      setLoading(true);
      anApi.deleteAnnotation(mbUser, props.annotation.id, props.appContext.authErrAction).then(
        () => {
          setLoading(false);
          setPendingDelete(false);
          anNotify(props.sysContext.config, ActionEnum.DELETE, props.annotation);
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

    type Params = 
      { part: "Page"; url: string; thisPart: boolean } |
      { part: "Link"; url: string; thisPart: boolean } |
      { part: "Selection"; selection: string }
    
    function renderTargetPart(params: Params): React.ReactElement {
      return (
        <div className="mr-2 mb-2">
          {(params.part === "Page" || params.part === "Link") && params.thisPart ?
            <span className="badge badge-secondary">
              This {params.part}
            </span>
          :
            <a 
            href={params.part === "Page" || params.part === "Link" ? params.url : "#"}
            target="_blank" rel="noreferrer">
              <span className="badge badge-info"
                data-toggle="tooltip" data-placement="bottom" 
                title={params.part === "Selection" ? params.selection : params.url}>
                {params.part}
              </span>
            </a>
          }
        </div>
      );
    }

    return (
      <div className="d-flex flex-row">
        {renderTargetPart({ part: "Page", url: target.id, thisPart: thisId })}
        {target.source ? renderTargetPart({ part: "Link", url: target.source, thisPart: thisSource }) : <></>}
        {target.selector ? renderTargetPart({ part: "Selection", selection: target.selector.selection}) : <></>}
      </div>
    );
  }

  const padded = { padding: "0 5px"};

  function renderAnActions(): React.ReactElement {
    return (
      <>
        <VisibilitySwitcher
          text={false}
          small={true}
          visibility={annotation.visibility}
          setVisibility={updateVisibility}/>
        <div className="btn-group" style={padded}>
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
    const isMine = anModel.isMine(annotation, mbUserPID);

    return (
      <div className="ml-2 pb-2 border-bottom">
        {renderTarget()}
        {isMine ?
          <AnTagView
            sysContext={props.sysContext}
            appContext={props.appContext}
            annotation={annotation}
            anChangedHandler={an => { if (props.anChangedHandler) { props.anChangedHandler(an); } }}
          />
        : <></>
        }
        <div className="mt-2 d-flex flex-row">
          {isMine ? 
            renderAnActions()
          :
            <icons.OthersIcon className="text-secondary"
              data-toggle="tooltip" data-placement="bottom" title="Other's annotation"/>
          }
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 mr-2">
      {pendingDelete ?
        renderDeleteConfirmation()
      : renderView()}
      {errorMessage || loading ?
        <div className="row mt-2 justify-content-center">
          <SpinningWheel show={loading}/>
          <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
        </div>
      : <></>
      }
    </div>
  );
}
