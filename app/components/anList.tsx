import _ from "lodash";
import * as React from "react";
import type { SysContext, AppContext } from "app/context";
import * as icons from "./icons";
import * as anModel from "core/annotationsModel";
import * as tr from "./tagRecord";
import { AnTagDisplay } from "./tagDisplay";
import AnView from "./anView";
import type { TagRecord } from "./tagRecord";
import type { OntologyInfoRequest } from "./ontologyInfoPanel";
import OntologyInfoPanel from "./ontologyInfoPanel";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
  annotations: Array<anModel.Annotation>;
  maxTagLen?: number;
  displayTargets?: boolean;
  changedHandler?: (an: anModel.Annotation) => void;
  ontologyInfoHandler?: (visible: boolean) => void;
}

export default function AnList(props: Props): React.FunctionComponentElement<Props> {
  const [tagRecords, setTagRecords] = React.useState(tr.mkTagRecords(props.annotations));
  const [ontologyInfoRequest, setOntologyInfoRequest] = React.useState(null as OntologyInfoRequest|null);

  React.useEffect(
    () => {
      setTagRecords(tr.mkTagRecords(props.annotations));
    },
    [props.annotations]
  );

  function openOntologiesInfo(oInfoReq: OntologyInfoRequest): void {
    setOntologyInfoRequest(oInfoReq);
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
      tagRecords.findIndex(tr1 => tr1.tag === anModel.getLabel(an) && tr1.anBodyType === anModel.getAnBodyType(an.body));
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

      function currentTarget(an: anModel.Annotation): boolean {
        return an.target.id === props.sysContext.mbTarget?.pid;
      }

      function renderTargets(): React.ReactElement {
        const anl = tagRecord.annotations;
        return (
          <div className="ml-4">
            {anl.some(currentTarget) ? 
              <div className="bg-light mb-1 font-italic">this page</div>
            : <></>}
            {tagRecord.annotations.map(
              an => {
                return (
                    <div key={an.id} className="bg-light mb-1">
                    {!currentTarget(an) ? 
                      <a href={an.target.id} target="_blank" rel="noreferrer">{an.target.id}</a>
                    : <></>}
                  </div>
                );
              }
            )}
          </div>
        );
      }

      function renderAnnotationsBadge(): React.ReactElement {
        return (
          <div className="d-flex flex-row">
            <span className="badge badge-secondary" style={{verticalAlign: "middle"}}
              data-toggle="tooltip" data-placement="bottom" title="Number of annotations with this tag"
            >{tagRecord.annotations.length}</span>
            <button type="button"
              className="btn btn-sm btn-outline-primary"
              style={{padding: "0 4px 3px 0", marginLeft: 5}}
              onClick={() => toggleShowAnnotationsFlag(tagRecord)}>
              {tagRecord.showAnnotationsFlag ? <icons.HideIcon/> : <icons.ShowIcon/>}
            </button>
          </div>
        );
      }

      function renderAnnotations(): React.ReactElement {
        return (
          <div className="mb-0">
            {tagRecord.annotations.map(
              an =>
                <div key={an.id}>
                  <AnView
                    sysContext={props.sysContext}
                    appContext={props.appContext}
                    annotation={an}
                    anChangedHandler={(newAn) => replaceAn(newAn)}
                    anDeletedHandler={() => deleteAn(an)}
                  />
                </div>
            )}
          </div>
        );
      }

      const an = tagRecord.annotations[0];
      return (
        <div key={tagRecord.tag + "_" + tagRecord.anBodyType} className="pl-1 mb-1">
          <div className={tagRecord.showAnnotationsFlag ? "border-top border-bottom bg-light pl-1 mb-1 pt-1" : ""}>
            <div className="row justify-content-between ml-1 mr-1 mb-1">
              <div style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>
                <AnTagDisplay
                  anBody={an.body}
                  maxLen={34}
                  onClick={() => openOntologiesInfo({ label: anModel.getLabel(an), uris: anModel.getSourcesFromAnBody(an.body) })}
                />
              </div>
              <div style={{paddingLeft: 0, paddingRight: 0, marginRight: 5}}>
                {renderAnnotationsBadge()}
              </div>
            </div>
            {tagRecord.showAnnotationsFlag ?
              <div>
                <div className="condensed">
                  {renderAnnotations()}
                </div>
              </div> : <></>}
          {!tagRecord.showAnnotationsFlag && props.displayTargets ? renderTargets() : <></>} 
          </div>
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
        appContext={props.appContext}
        infoRequest={ontologyInfoRequest}
        closeFn={closeOntologiesInfo}
      />
    :
    <div className="d-flex flex-row">
      {renderAnnotationsList()}
    </div>
  );
}
