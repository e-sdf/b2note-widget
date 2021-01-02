import * as React from "react";
import { matchSwitch } from "@babakness/exhaustive-type-checking";
import type { SysContext, AppContext } from "app/context";
import * as icons from "./icons";
import { loggedUserPID } from "app/context";
import { SelectorType } from "core/annotationsModel";
import * as anModel from "core/annotationsModel";
import * as anApi from "../api/annotations";
import AnTagView from "./anTagView";
import VisibilitySwitcher from "./visibilitySwitcher";
import { ActionEnum, anNotify } from "app/notify";
import Alert from "app/components/alert";
import SpinningWheel from "app/components/spinningWheel";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
  annotation: anModel.Annotation;
  anChangedHandler?: (newAn: anModel.Annotation) => void;
  anDeletedHandler?: () => void;
}

export default function AnView(props: Props): React.FunctionComponentElement<Props> {
  const [pendingDelete, setPendingDelete] = React.useState(false);
  const [edited, setEdited] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const annotation = props.annotation;
  const target = annotation.target;
  const annotatedTarget = props.sysContext.mbTarget;
  const thisId = target.id === annotatedTarget?.pid;
  const thisSource = (target as any).source === (annotatedTarget as any).source;
  const mbUser = props.appContext.mbUser;
  const mbUserPID = loggedUserPID(props.sysContext, props.appContext);

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

    interface UrlObject {
      type: string;
      name: string|undefined;
      url: string;
      thisUrl: boolean;
    }

    function renderUrlBadge(o: UrlObject): React.ReactElement {
      const lbl = o.name || o.url;
      return (
        <div className="mr-2">
          {o.thisUrl ?
            <div className="badge badge-secondary">
              This {o.type}
            </div>
          :
            <a
            href={o.url}
            target="_blank" rel="noreferrer">
              <div className="badge badge-info"
                data-toggle="tooltip" data-placement="bottom" title={o.type}>
                {lbl}
              </div>
            </a>
          }
        </div>
      );
    }

    return (
      <div>
        {renderUrlBadge({ type: "Page", name: target.idName, url: target.id, thisUrl: thisId })}
        {target.source ?
          renderUrlBadge({ type: "Link", name: target.sourceName, url: target.source, thisUrl: thisSource }) : <></>}
        {target.selector ?
          matchSwitch(target.selector.type, {
            [SelectorType.XPATH]: () =>
              <div className="badge badge-info"
                data-toggle="tooltip" data-placement="bottom"
                title={(target.selector as anModel.XPathTextSelector).selectedText}>
                Text selection
              </div>,
            [SelectorType.SVG]: () =>
              <div className="badge badge-info">
                Image selection
              </div>,
            [SelectorType.PDF]: () => {
              const s = target.selector as anModel.PdfSelector;
              return (
                <>
                  <div className="badge badge-info">
                    PDF page {s.pageNumber}
                  </div>
                  {s.selector ?
                    <div className="badge badge-info ml-1">
                      Selection
                    </div>
                  : <></>}
                </>
              );
            },
            [SelectorType.TABLE]: () => {
              const s = target.selector as anModel.TableSelector;
              return (
                <div className="badge badge-info">
                  Table {s.sheet} {s.range ? anModel.printTableRange(s.range) : ""}
                </div>
              );
            }
          }) : <></>}
      </div>
    );
  }

  const padded = { padding: "0 5px"};

  function renderAnActions(): React.ReactElement {
    return (
      <>
        {!edited ?
          <VisibilitySwitcher
            text={false}
            small={true}
            visibility={annotation.visibility}
            setVisibility={updateVisibility}/>
        : <></>}
        <div className="btn-group" style={padded}>
          <AnTagView
            sysContext={props.sysContext}
            appContext={props.appContext}
            annotation={annotation}
            editedHandler={setEdited}
            anChangedHandler={an => { if (props.anChangedHandler) { props.anChangedHandler(an); } }}/>
          {!edited ?
            <button type="button"
              className="btn btn-sm btn-outline-danger"
              data-toggle="tooltip" data-placement="bottom" title="Delete this annotation"
              onClick={() => setPendingDelete(true)}>
              <icons.DeleteIcon/>
            </button>
          : <></>}
        </div>
      </>
    );
  }

  function renderView(): React.ReactElement {
    const isMine = anModel.isMine(annotation, mbUserPID);

    return (
      <div className="ml-2 pb-2 border-bottom">
        {renderTarget()}
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
