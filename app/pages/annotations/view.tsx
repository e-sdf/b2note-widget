import _ from "lodash";
import * as React from "react";
import * as icons from "../../components/icons";
import * as anModel from "../../core/annotationsModel";
import * as anApi from "../../api/annotations";
import type { PageProps } from "../pages";
import { showAlertSuccess, showAlertError } from "../../components/ui"; 
import SpinningWheel from "../../components/spinningWheel";
import AnView from "../../components/anView";
import type { TagRecord } from "./loader";
import { LoaderFilter } from "./loader";
import AnnotationTag from "../../components/annotationTag";
import TagEditor from "../../components/tagEditor";
import InfoPanel from "../../components/infoPanel";
import { ActionEnum, notify } from "../notify";

const alertId = "anlAlert";

export default function AnnotationsPage(props: PageProps): React.FunctionComponentElement<PageProps> {
  const loaderRef = React.useRef(null as any);
  const [tagRecords, setTagRecords] = React.useState(null as Array<TagRecord>|null);
  const [loading, setLoading] = React.useState(false);
  const [activeRecord, setActiveRecord] = React.useState(null as TagRecord|null);
  const [ontologyInfoRequest, setOntologyInfoRequest] = React.useState(null as anModel.Annotation|null);
  const [editedAn, setEditedAn] = React.useState(null as anModel.Annotation|null);
  const mbUser = props.context.mbUser;

  //React.useEffect(() => console.log(annotations), [annotations]);

  function reload(): void {
    if (loaderRef.current) { loaderRef.current.loadAnnotations(); }
  }

  function updateAn(an: anModel.Annotation, newBody: anModel.AnBody): void {
    if (mbUser) {
      anApi.patchAnnotationBody(mbUser, an.id, newBody, props.authErrAction).then(
        (newAn) => {
          showAlertSuccess(alertId, "Annotation updated");
          notify(ActionEnum.EDIT, newAn);
          reload();
        },
        (err) => {
          showAlertError(alertId, err);
        }
      );
    }
  }

  function deleteAn(an: anModel.Annotation): void {
    if (mbUser) {
      anApi.deleteAnnotation(mbUser, an.id, props.authErrAction).then(
        () => {
          showAlertSuccess(alertId, "Annotation deleted");
          notify(ActionEnum.DELETE, an);
          reload();
        },
        (err) => {
          showAlertError(alertId, err);
        }
      );
    }
  }

  function closeOntologiesInfo(): void {
    setOntologyInfoRequest(null);
  }

  function renderTagRecord(tagRecord: TagRecord): React.ReactElement {
    const visibility = activeRecord?.tag === tagRecord.tag ? "visible" : "hidden";

    function toggleShowAnnotationsFlag(tagRecord: TagRecord): void {
      const tr2 = tagRecords?.map(r => _.isEqual(r, tagRecord) ? { ...r, showAnnotationsFlag: !r.showAnnotationsFlag } : r);
      setTagRecords(tr2 || []);
    }
  
    function renderAnnotationsBadge(): React.ReactElement {
      return (
        <div className="d-flex flex-row">
          <span className="badge badge-secondary" style={{verticalAlign: "middle"}}
            data-toggle="tooltip" data-placement="bottom" title="Number of annotations with this tag"
          >{tagRecord.annotations.length}</span>
          <button type="button" 
            className="btn btn-sm btn-outline-primary list-action-button"
            style={{padding: "0 4px 3px 0"}}
            onClick={() => toggleShowAnnotationsFlag(tagRecord)}>
            {tagRecord.showAnnotationsFlag ? <icons.HideIcon/> : <icons.ShowIcon/>}
          </button>
        </div>
      );
    }

    function renderActionButtons(): React.ReactElement {
      return (
        <></>
        // TODO: actions on all private annotations
        //<>
          //<button type="button"
            //className="btn btn-sm btn-outline-primary list-action-button mr-1"
            //data-toggle="tooltip" data-placement="bottom" title="Edit all tags"
            //onClick={() => setEditedAn(annotation)}
          //><icons.EditIcon/>
          //</button>
          //<button type="button"
            //className="btn btn-sm btn-outline-primary list-action-button"
            //data-toggle="tooltip" data-placement="bottom" title="Delete all tags"
            //onClick={() => setPendingDeleteAn(annotation)}
          //><icons.DeleteIcon/>
          //</button>
        //</>
      );
    }

    function renderAnnotations(): React.ReactElement {
      return (
        <table className="table mb-0">
          <tbody>
            {tagRecord.annotations.map(an =>
            <AnView key={an.id}
              context={props.context} 
              annotation={an}
              updateHandler={(newBody) => updateAn(an, newBody)}
              deleteHandler={() => deleteAn(an)}
            />
            )}
          </tbody>
        </table>
      );
    }

    function renderNormalRow(): React.ReactElement {
      return (
        <>
          <tr onMouseOver={() => setActiveRecord(tagRecord)} onMouseLeave={() => setActiveRecord(null)}>
            <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>
              <AnnotationTag 
                mbUser={props.context.mbUser}
                annotation={tagRecord.annotations[0]}
                maxLen={17}
                onClick={() => setOntologyInfoRequest(tagRecord.annotations[0])}/>
            </td>
            <td style={{paddingLeft: 0, paddingRight: 0}}>
              {renderAnnotationsBadge()}
            </td>
            {/*<td style={{whiteSpace: "nowrap", paddingLeft: 0, paddingRight: 0, visibility}}>
              {anModel.targeCreatorId(annotation) === (props.context.mbUser?.profile.id || "") ? renderActionButtons() : <></>}
              </td>*/}
          </tr>
          {tagRecord.showAnnotationsFlag ? 
            <tr>
              <td colSpan={3} className="condensed">
                {renderAnnotations()}
              </td>
            </tr> : <></>}
        </>
      );
    }
    
    return (
      <React.Fragment key={tagRecord.tag + "_" + tagRecord.anType}>
        {/*annotation.id === editedAn?.id ?
          <TagEditor context={props.context} annotation={annotation} doneHandler={editDone} errorHandler={editError} authErrAction={props.authErrAction}/>
        : renderNormalRow()
          */}
        {renderNormalRow()}
      </React.Fragment>
    );
  }

  function renderAnnotationsTable(): React.ReactElement {
    return (
      <div className="container-fluid">
        <LoaderFilter 
          ref={loaderRef}
          context={props.context}
          setTagRecordsFn={setTagRecords}
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
          {tagRecords !== null ?
            tagRecords.length > 0 ? 
              <>
                <table className="table anl-table">
                  <tbody>
                    {tagRecords.map(tagRecord=> renderTagRecord(tagRecord))}
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
        annotation={ontologyInfoRequest}
        closeFn={closeOntologiesInfo}
      />
    : renderAnnotationsTable()
  );
}
