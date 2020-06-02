import _ from "lodash";
import * as React from "react";
import * as icons from "../../components/icons";
import * as anModel from "../../core/annotationsModel";
import * as anApi from "../../api/annotations";
import type { PageProps } from "../pages";
import { showAlertSuccess, showAlertError } from "../../components/ui"; 
import SpinningWheel from "../../components/spinningWheel";
import { LoaderFilter, AnItem } from "./loader";
import AnnotationTag from "../../components/annotationTag";
import TargetTr from "../../components/targetTr";
import InfoPanel from "../../components/infoPanel";
import * as ac from "../../components/autocomplete/view";

const alertId = "anlAlert";

interface TagEditorProps extends PageProps {
  anRecord: anModel.AnRecord;
  doneHandler(): void;
}

function TagEditor(props: TagEditorProps): React.FunctionComponentElement<TagEditorProps> {
  const [uris, setUris] = React.useState([] as Array<string>);
  const [label, setLabel] = React.useState(anModel.getLabel(props.anRecord));
  const [ref, setRef] = React.useState(null as any);
  const user = props.context.mbUser;

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    setUris((suggestions[0].items || []).map(i => i.uris));
    setLabel(suggestions[0].labelOrig || "");
  }

  function update(): void {
    if (user) {
     const body = 
       anModel.isSemantic(props.anRecord) ?
         anModel.mkSemanticAnBody(uris, label)
       : anModel.isKeyword(props.anRecord) ?
         anModel.mkKeywordAnBody(label)
       : anModel.mkCommentAnBody(label);
      anApi.patchAnnotationBody(user, props.anRecord.id, body, props.authErrAction).then(
        () => {
          showAlertSuccess(alertId, "Annotation updated");
          props.doneHandler();
        },
        (err) => {
          showAlertError(alertId, err);
        }
      );
    }
  }

  React.useEffect(() => {
    if (ref) {
      ref.focus();
    }
  }, [ref]);

  return (
    <tr>
      <td colSpan={3}>
        <div className="d-flex flex-row">
          {anModel.isSemantic(props.anRecord) ?
            <ac.SemanticAutocomplete 
              id="annotations-semantic-autocomplete"
              ref={(comp) => setRef(comp)} 
              defaultInputValue={label}
              onChange={gotSuggestion}
            />
          : <input type="text" className="form-control"
              value={label} 
              onChange={ev => setLabel(ev.target.value)}
            />
          }
          <button type="button" className="btn btn-primary"
            disabled={label.length === 0}
            onClick={() => {
              update();
              if (ref) {
                ref.clear();
              }
            }}>
            <icons.SaveIcon/>
          </button>
          <button type="button" className="btn btn-danger"
            onClick={() => props.doneHandler()}>
            <icons.CancelIcon/>
          </button>
        </div>
        </td>
    </tr>
  );
}

export default function AnnotationsPage(props: PageProps): React.FunctionComponentElement<PageProps> {
  const loaderRef = React.useRef(null as any);
  const [annotations, setAnnotations] = React.useState(null as Array<AnItem>|null);
  const [loading, setLoading] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(null as string|null);
  const [ontologyInfoRequest, setOntologyInfoRequest] = React.useState(null as anModel.AnRecord|null);
  const [editedRecordId, setEditedRecordId] = React.useState(null as string|null);
  const [pendingDeleteId, setPendingDeleteId] = React.useState(null as string|null);
  const user = props.context.mbUser;

  //React.useEffect(() => console.log(annotations), [annotations]);

  function closeOntologiesInfo(): void {
    setOntologyInfoRequest(null);
  }

  function renderAnItem(anItem: AnItem): React.ReactElement {
    const anRecord = anItem.anRecord;
    const label = anModel.getLabel(anRecord);
    const visibility = activeItem === label ? "visible" : "hidden";

    function toggleShowFilesFlag(anItem: AnItem): void {
      const anl2 = annotations?.map(a => _.isEqual(a, anItem) ? { ...a, showFilesFlag: !a.showFilesFlag } : a);
      setAnnotations(anl2 || []);
    }
  
    function renderFilesBadge(): React.ReactElement {
      return (
        <div className="d-flex flex-row">
          <span className="badge badge-secondary" style={{verticalAlign: "middle"}}
            data-toggle="tooltip" data-placement="bottom" title="Number of files with this annotation"
          >{anItem.targets.length}</span>
          <button type="button" 
            className="btn btn-sm btn-outline-primary list-action-button"
            style={{padding: "0 4px 3px 0"}}
            onClick={() => toggleShowFilesFlag(anItem)}>
            {anItem.showFilesFlag ? <icons.HideIcon/> : <icons.ShowIcon/>}
          </button>
        </div>
      );
    }

    function renderActionButtons(): React.ReactElement {
      return (
        <>
          <button type="button"
            className="btn btn-sm btn-outline-primary list-action-button mr-1"
            data-toggle="tooltip" data-placement="bottom" title="Edit"
            onClick={() => setEditedRecordId(anRecord.id)}
          ><icons.EditIcon/>
          </button>
          <button type="button"
            className="btn btn-sm btn-outline-primary list-action-button"
            data-toggle="tooltip" data-placement="bottom" title="Delete"
            onClick={() => setPendingDeleteId(anRecord.id)}
          ><icons.DeleteIcon/>
          </button>
        </>
      );
    }

    function renderTargets(): React.ReactElement {
      return (
        <table className="table mb-0">
          <tbody>
            {anItem.targets.map(t =>
              <TargetTr key={t.source} mbContextTarget={props.context.mbTarget} target={t}/>)}
          </tbody>
        </table>
      );
    }

    function renderDeleteConfirmation(): React.ReactElement {
      return (
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
                  if (pendingDeleteId && user) {
                    anApi.deleteAnnotation(user, pendingDeleteId, props.authErrAction).then(
                      () => {
                        if (loaderRef.current) { loaderRef.current.loadAnnotations(); }
                      },
                      (err) => {
                        showAlertError(alertId, err);
                      }
                    );
                  }
                }}>
                Yes
              </button>
              <button type="button"
                className="btn btn-sm btn-success ml-3"
                style={{marginLeft: "5px"}}
                onClick={() => setPendingDeleteId(null)}>
                No
              </button>
            </div>
          </div>
        </td>
      );
    }

    function renderNormalRow(): React.ReactElement {
      return (
        <>
          <tr onMouseOver={() => setActiveItem(label)} onMouseLeave={() => setActiveItem(null)}>
            <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>
              <AnnotationTag 
                mbUser={props.context.mbUser}
                anRecord={anRecord}
                maxLen={17}
                onClick={() => setOntologyInfoRequest(anRecord)}/>
            </td>
            <td style={{paddingLeft: 0, paddingRight: 0}}>
              {renderFilesBadge()}
            </td>
            <td style={{whiteSpace: "nowrap", paddingLeft: 0, paddingRight: 0, visibility}}>
              {anModel.getCreatorId(anRecord) === (props.context.mbUser?.profile.id || "") ? renderActionButtons() : <></>}
            </td>
          </tr>
          {pendingDeleteId === anRecord.id ? 
            <tr>
              {renderDeleteConfirmation()}
            </tr> : <></>}
          {anItem.showFilesFlag ? 
            <tr>
              <td colSpan={3} className="condensed">
                {renderTargets()}
              </td>
            </tr> : <></>}
        </>
      );
    }
    
    function reload(): void {
      setEditedRecordId(null);
      if (loaderRef.current) { loaderRef.current.loadAnnotations(); }
    }

    return (
      <React.Fragment key={anRecord.id}>
        {anRecord.id === editedRecordId ?
          <TagEditor context={props.context} anRecord={anRecord} doneHandler={reload} authErrAction={props.authErrAction}/>
        : renderNormalRow()
        }
      </React.Fragment>
    );
  }

  function renderAnnotationsTable(): React.ReactElement {
    return (
      <div className="container-fluid">
        <LoaderFilter 
          ref={loaderRef}
          context={props.context}
          setAnItemsFn={setAnnotations}
          setLoaderFlagFn={setLoading}/>
        <div className="row mt-2">
          <div className="col-sm">
            <div id={alertId}></div>
          </div>
        </div>
        <div className="row mt-2 justify-content-center">
            <SpinningWheel show={loading}/>
        </div>
        <div className="row">
          {annotations !== null ?
            annotations.length > 0 ? 
              <>
                <table className="table anl-table">
                  <tbody>
                    {annotations.map(anItem=> renderAnItem(anItem))}
                  </tbody>
                </table>
              </>
            : <div className="col-sm" style={{fontStyle: "italic"}}>No annotations matching the filters</div>
          : <></>}
        </div>
      </div>
    );
  }

  return (
    ontologyInfoRequest ?
      <InfoPanel 
        anRecord={ontologyInfoRequest}
        closeFn={closeOntologiesInfo}
      />
    : renderAnnotationsTable()
  );
}
