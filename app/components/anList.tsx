import _ from "lodash";
import * as React from "react";
import * as icons from "./icons";
import * as anModel from "../core/annotationsModel";
import * as anApi from "../api/annotations";
import * as tr from "./tagRecord";
import type { ApiComponent } from "./defs";
import AnLine from "./anLine";
import SpinningWheel from "./spinningWheel";
import Alert from "./alert";
import type { TagRecord } from "./tagRecord";
import AnTag from "./anTag";
import OntologyInfoPanel from "./ontologyInfoPanel";
import { ActionEnum, notify } from "./notify";

interface Props extends ApiComponent {
  annotations: Array<anModel.Annotation>;
  changedHandler?: (an: anModel.Annotation) => void;
  ontologyInfoHandler?: (visible: boolean) => void;
}

export default function AnList(props: Props): React.FunctionComponentElement<Props> {
  const [tagRecords, setTagRecords] = React.useState(tr.mkTagRecords(props.annotations));
  const [activeRecord, setActiveRecord] = React.useState(null as TagRecord|null);
  const [ontologyInfoRequest, setOntologyInfoRequest] = React.useState(null as anModel.Annotation|null);

  React.useEffect(() => setTagRecords(tr.mkTagRecords(props.annotations)), [props.annotations]);

  function openOntologiesInfo(an: anModel.Annotation): void {
    setOntologyInfoRequest(an);
    if (props.ontologyInfoHandler) { props.ontologyInfoHandler(true); }
  }


  function closeOntologiesInfo(): void {
    setOntologyInfoRequest(null);
    if (props.ontologyInfoHandler) { props.ontologyInfoHandler(false); }
  }

  function replaceAn(an: anModel.Annotation): void {
    const tri =
      tagRecords.findIndex(tr1 => tr1.annotations.find(an1 => an1.id === an.id));
    if (tri < 0) {
      throw new Error(`tagRecord ${anModel.getLabel(an)} not found`);
    } else {
      const ani = tagRecords[tri].annotations.findIndex(an1 => an1.id === an.id);
      if (ani < 0) {
        throw new Error(`annotation ${an.id} not found in ${tagRecords[tri]}`);
      } else {
        const trs2 = _.clone(tagRecords);
        trs2[tri].annotations[ani] = an;
        setTagRecords(trs2);
      }
    }
  }

  function deleteAn(an: anModel.Annotation): void {
    const tri =
      tagRecords.findIndex(tr1 => tr1.tag === anModel.getLabel(an) && tr1.anType === anModel.getAnType(an));
    if (tri < 0) {
      throw new Error(`tagRecord ${anModel.getLabel(an)} not found`);
    } else {
      const ans2 = _.filter(tagRecords[tri].annotations, an1 => an1.id !== an.id);
      const trs2 = _.clone(tagRecords);
      if (ans2.length === 0) {
        trs2.splice(tri, 1);
      } else {
        trs2[tri].annotations = ans2;
      }
      setTagRecords(trs2);
    }
  }

  function renderAnnotationsList(): React.ReactElement {

    function renderTagRecord(tagRecord: TagRecord): React.ReactElement {

      function toggleShowAnnotationsFlag(tagRecord: TagRecord): void {
        const tr2 = tagRecords.map(r => _.isEqual(r, tagRecord) ? { ...r, showAnnotationsFlag: !r.showAnnotationsFlag } : r);
        setTagRecords(tr2 || []);
      }

      function renderAnnotationsBadge(): React.ReactElement {
        return (
          <div className="d-flex flex-row">
            <span className="badge badge-secondary" style={{verticalAlign: "middle"}}
              data-toggle="tooltip" data-placement="bottom" title="Number of annotations with this tag"
            >{tagRecord.annotations.length}</span>
            <button type="button"
              className="btn btn-sm btn-outline-primary"
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
          // TODO: actions on all own annotations
          //<>
            //<button type="button"
              //className="btn btn-sm btn-outline-primary mr-1"
              //data-toggle="tooltip" data-placement="bottom" title="Edit all tags"
              //onClick={() => setEditedAn(annotation)}
            //><icons.EditIcon/>
            //</button>
            //<button type="button"
              //className="btn btn-sm btn-outline-primary"
              //data-toggle="tooltip" data-placement="bottom" title="Delete all tags"
              //onClick={() => setPendingDeleteAn(annotation)}
            //><icons.DeleteIcon/>
            //</button>
          //</>
        );
      }

      function renderAnnotations(): React.ReactElement {
        return (
          <div className="mb-0 pb-2">
            {tagRecord.annotations.map(
              an =>
                <div key={an.id} className="pt-2">
                  <AnLine
                    context={props.context}
                    authErrAction={props.authErrAction}
                    annotation={an}
                    anChangedHandler={(newAn) => replaceAn(newAn)}
                    anDeletedHandler={() => deleteAn(an)}
                  />
                </div>
            )}
          </div>
        );
      }

      function renderNormalRow(): React.ReactElement {
        return (
          <div className={tagRecord.showAnnotationsFlag ? "border-top border-bottom bg-light pt-1" : ""}>
            <div className="row justify-content-between ml-1 mr-1 mb-1"
              onMouseOver={() => setActiveRecord(tagRecord)}
              onMouseLeave={() => setActiveRecord(null)}>
              <div style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>
                <AnTag
                  mbUser={props.context.mbUser}
                  annotation={tagRecord.annotations[0]}
                  maxLen={17}
                  onClick={() => openOntologiesInfo(tagRecord.annotations[0])}/>
              </div>
              <div style={{paddingLeft: 0, paddingRight: 0}}>
                {renderAnnotationsBadge()}
              </div>
              {/*<div style={{whiteSpace: "nowrap", paddingLeft: 0, paddingRight: 0, visibility}}>
                {anModel.targeCreatorId(annotation) === (props.context.mbUser?.profile.id || "") ? renderActionButtons() : <></>}
                </div>*/}
            </div>
            {tagRecord.showAnnotationsFlag ?
              <div>
                <div className="condensed">
                  {renderAnnotations()}
                </div>
              </div> : <></>}
          </div>
        );
      }

      return (
        <div key={tagRecord.tag + "_" + tagRecord.anType} className="pl-1 mb-1">
          {/*annotation.id === editedAn?.id ?
            <TagEditor context={props.context} annotation={annotation} doneHandler={editDone} errorHandler={editError} authErrAction={props.authErrAction}/>
          : renderNormalRow()
            */}
          {renderNormalRow()}
        </div>
      );
    }

    return (
      tagRecords !== null ?
        tagRecords.length > 0 ?
          <div className="w-100">
            {tagRecords.map(tagRecord=> renderTagRecord(tagRecord))}
          </div>
        : <div className="col-sm" style={{fontStyle: "italic"}}>No annotations matching the filters</div>
      : <></>
    );
  }

  return (
    ontologyInfoRequest ?
      <OntologyInfoPanel
        annotation={ontologyInfoRequest}
        closeFn={closeOntologiesInfo}
      />
    : 
    <div className="d-flex flex-row">
      {renderAnnotationsList()}
    </div>
  );
}
