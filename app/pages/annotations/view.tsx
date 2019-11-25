import * as _ from "lodash";
import allSettled from "promise.allsettled";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import * as anModel from "../../shared/annotationsModel";
import * as api from "../../api/annotations";
import { Context } from "../../widget/context";
import { showAlertError } from "../../components"; 
import { LoaderFilter, AnItem } from "./loader";
import * as ontology from "./ontologyInfo";
import { InfoPanel } from "./infoPanel";

const SemanticIcon = icons.FaCode;
const KeywordIcon = icons.FaQuoteRight;
const CommentIcon = icons.FaCommentDots;
const EditIcon = icons.FaEdit;
const DeleteIcon = icons.FaTrashAlt;
const ShowFilesIcon = icons.FaChevronRight;
const HideFilesIcon = icons.FaChevronDown;

const alertId = "anlAlert";

interface Props {
  context: Context;
}

export function Annotations(props: Props): React.FunctionComponentElement<Props> {
  const loaderRef = React.useRef(null as any);
  const [annotations, setAnnotations] = React.useState([] as Array<AnItem>);
  const [activeItem, setActiveItem] = React.useState(null as string|null);
  const [pendingDeleteId, setPendingDeleteId] = React.useState(null as string|null);
  const [ontologyInfos, setOntologyInfos] = React.useState(null as Array<ontology.OntologyInfo>|null);

  const shorten = (lbl: string, lng: number): string => lbl.length > lng ? lbl.substring(0, lng) + "..." : lbl;

  function loadOntologiesInfo(anRecord: anModel.AnRecord): void {
    const iris = anRecord.body.items.filter((i: anModel.AnBodyItem) => i.type === anModel.BodyItemType.SPECIFIC_RESOURCE)
      .map((i: anModel.AnBodyItem) => i.source);
    const infoPms = iris.map((iri: string) => ontology.getInfo(iri));
    allSettled<ontology.OntologyInfo>(infoPms).then(
      (results) => {
        const settled = results.filter(r => r.status === "fulfilled") as Array<allSettled.PromiseResolution<ontology.OntologyInfo>>;
        const infos = settled.map(s  => s.value);
        setOntologyInfos(infos);
      }
    );
  }

  function closeOntologiesInfo() {
    setOntologyInfos(null);
  }

  function renderAnItem(anItem: AnItem): React.ReactElement {
    const anRecord: anModel.AnRecord = anItem.anRecord;
    const label = anModel.getLabel(anRecord);
    const visibility = activeItem === label ? "visible" : "hidden";

    function renderLabel(): React.ReactElement {
      const icon = 
        anModel.isComment(anRecord) ? 
          <CommentIcon className="text-secondary"/> 
        : anModel.isSemantic(anRecord) ?
          <SemanticIcon className="text-secondary"/>
        : <KeywordIcon className="text-secondary"/>;
      const itemStyle = anRecord.creator.id === props.context.user.id ? {} : { fontStyle: "italic" };
      const shortened = shorten(label, 14);

      function renderSemanticLabel(): React.ReactElement {
        return (
          <a
            href="#"
            style={itemStyle}
            data-toggle="tooltip" data-placement="bottom" title={label}
            onClick={() => loadOntologiesInfo(anRecord)}
            >{`${shortened} (${anModel.getNoOfTargets(anRecord)})`}
          </a>
        );
      }

      function renderOtherLabel(): React.ReactElement {
        return (
          <span
            style={itemStyle}
            data-toggle="tooltip" data-placement="bottom" title={label}>
            {shortened}
          </span>
        );
      }

      return (
        <React.Fragment>
          {icon}<span> </span>
          {anModel.isSemantic(anRecord) ?
            renderSemanticLabel()
          : renderOtherLabel()}
        </React.Fragment>
      );
    }

    function toggleShowFilesFlag(anItem: AnItem): void {
      const anl2 = annotations.map(a => _.isEqual(a, anItem) ? { ...a, showFilesFlag: !a.showFilesFlag } : a);
      setAnnotations(anl2);
    }
  
    function renderFilesBadge(): React.ReactElement {
      return (
        <React.Fragment>
          <span className="badge badge-secondary" style={{verticalAlign: "middle"}}
            data-toggle="tooltip" data-placement="bottom" title="Number of files with this annotation"
          >{anItem.files.length}</span>
          <button type="button" 
            className="btn btn-sm btn-outline-primary anl-action-button"
            style={{padding: "0 4px 3px 0"}}
            onClick={() => toggleShowFilesFlag(anItem)}>
            {anItem.showFilesFlag ? <HideFilesIcon/> : <ShowFilesIcon/>}
          </button>
        </React.Fragment>
      );
    }

    function renderActionButtons(): React.ReactElement {
      return (
        <React.Fragment>
          <button type="button"
            className="btn btn-sm btn-outline-primary anl-action-button mr-1"
            data-toggle="tooltip" data-placement="bottom" title="Edit"
          ><EditIcon/>
          </button>
          <button type="button"
            className="btn btn-sm btn-outline-primary anl-action-button"
            data-toggle="tooltip" data-placement="bottom" title="Delete"
            onClick={() => setPendingDeleteId(anRecord.id)}
          ><DeleteIcon/>
          </button>
        </React.Fragment>
      );
    }

    function renderFiles(): React.ReactElement {
      return (
        <div>
          {anItem.files.map(f => {
            const thisFile = f === props.context.resource.source;
            return (
              <div key={f}>
                <a 
                  data-toggle="tooltip" data-placement="bottom" title={f + (thisFile ? " (this file)" : " (other file)")}
                  href={f}>
                  <span className={thisFile ? "font-weight-bold" : ""}>{shorten(f, 36)}</span>
                </a>
              </div>
            );
          })}
        </div>
      );
    }

    function renderDeleteConfirmation(): React.ReactElement {
      return (
        <td colSpan={3} className="alert alert-danger" style={{borderTop: "none", borderRight: "none"}}>
        <span className="font-italic">Really delete the annotation?</span>
        <button type="button" 
          className="btn btn-sm btn-danger"
          style={{marginLeft: "5px", marginRight: "5px"}}
          onClick={() => {
            if (pendingDeleteId) {
              api.deleteAnnotation(pendingDeleteId).then(
                () => {
                  if (loaderRef.current) { loaderRef.current.loadAnnotations(); }
                },
                error => { console.log(error); showAlertError(alertId, "Deleting failed"); }
              );
              setPendingDeleteId(null);
            }
          }}>
          Yes
        </button>
          <button type="button"
            className="btn btn-sm btn-success"
            style={{marginLeft: "5px"}}
            onClick={() => setPendingDeleteId(null)}>
            No
          </button>
        </td>
      );
    }

    return (
      <React.Fragment key={label} >
        <tr onMouseOver={() => setActiveItem(label)} onMouseLeave={() => setActiveItem(null)}>
          <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>
            {renderLabel()}
          </td>
          <td style={{paddingLeft: 0}}>
            {renderFilesBadge()}
          </td>
          <td style={{whiteSpace: "nowrap", paddingLeft: 0, paddingRight: 0, visibility}}>
            {renderActionButtons()}
          </td>
        </tr>
        {pendingDeleteId === anRecord.id ? 
          <tr>
            {renderDeleteConfirmation()}
          </tr> : ""}
        {anItem.showFilesFlag ? 
          <tr>
            <td colSpan={3} style={{borderTop: "none", paddingTop: 0}}>
              {renderFiles()}
            </td>
          </tr> : ""}
      </React.Fragment>
    );
  }

  function renderMain(): React.ReactElement {
    return (
      <div className="container-fluid">
        <LoaderFilter ref={loaderRef} context={props.context} setAnItems={setAnnotations}/>
        <div className="row mt-2">
          <div className="col-sm">
            <div id={alertId}></div>
          </div>
        </div>
        <div className="row mt-2">
          <table className="table anl-table">
            <tbody>
              {annotations.map(anItem=> renderAnItem(anItem))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    ontologyInfos ?
      <InfoPanel 
        label={activeItem ? activeItem : ""}
        ontologyInfos={ontologyInfos}
        closeFn={closeOntologiesInfo}
      />
    : renderMain()
  );
}

export function render(context: Context): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<Annotations context={context}/>, container);
  } else {
    console.error("#page element missing");
  }
}

