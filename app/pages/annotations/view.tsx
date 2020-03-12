/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from "lodash";
import allSettled from "promise.allsettled";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import * as anModel from "../../core/annotationsModel";
import * as api from "../../api/annotations";
import type { Context } from "../../context";
import { showAlertSuccess, showAlertError } from "../../components/ui"; 
import { LoaderFilter, AnItem } from "./loader";
import AnnotationTag from "../../components/annotationTag";
import TargetTr from "../../components/targetTr";
import * as ac from "../../components/autocomplete/view";
import * as oreg from "../../core/ontologyRegister";
import { solrUrl } from "../../config";
import { InfoPanel } from "./infoPanel";

const EditIcon = icons.FaEdit;
const DeleteIcon = icons.FaTrashAlt;
const ShowFilesIcon = icons.FaChevronRight;
const HideFilesIcon = icons.FaChevronDown;
const SaveIcon = icons.FaSave;
const CancelIcon = icons.FaTimes;

const alertId = "anlAlert";

interface Props {
  context: Context;
}

interface TagEditorProps {
  context: Context;
  anRecord: anModel.AnRecord;
  doneHandler(): void;
}

function TagEditor(props: TagEditorProps): React.FunctionComponentElement<TagEditorProps> {
  const [uris, setUris] = React.useState([] as Array<string>);
  const [label, setLabel] = React.useState(anModel.getLabel(props.anRecord));
  const [ref, setRef] = React.useState(null as any);

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    setUris((suggestions[0].items || []).map(i => i.uris));
    setLabel(suggestions[0].labelOrig || "");
  }

  function update(): void {
   const body = 
     anModel.isSemantic(props.anRecord) ?
       anModel.mkSemanticAnBody(uris, label)
     : anModel.isKeyword(props.anRecord) ?
       anModel.mkKeywordAnBody(label)
     : anModel.mkCommentAnBody(label);
    api.patchAnnotationBody(props.anRecord.id, body, props.context).then(
      () => {
        showAlertSuccess(alertId, "Annotation updated");
        props.doneHandler();
      },
      (err) => {
        showAlertError(alertId, err);
      }
    );
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
            <SaveIcon/>
          </button>
          <button type="button" className="btn btn-danger"
            onClick={() => props.doneHandler()}>
            <CancelIcon/>
          </button>
        </div>
        </td>
    </tr>
  );
}

export function Annotations(props: Props): React.FunctionComponentElement<Props> {
  const loaderRef = React.useRef(null as any);
  const [annotations, setAnnotations] = React.useState([] as Array<AnItem>);
  const [activeItem, setActiveItem] = React.useState(null as string|null);
  const [editedRecordId, setEditedRecordId] = React.useState(null as string|null);
  const [pendingDeleteId, setPendingDeleteId] = React.useState(null as string|null);
  const [showOntologyInfos, setShowOntologyInfos] = React.useState(null as Array<oreg.OntologyInfo>|null);

  // React.useEffect(() => console.log(annotations), [annotations]);

  function loadOntologiesInfo(anRecord: anModel.AnRecord): void {
    const iris = anModel.getSources(anRecord);
    const infoPms = iris.map((iri: string) => oreg.getInfo(solrUrl, iri));
    allSettled<oreg.OntologyInfo>(infoPms).then(
      (results) => {
        const settled = results.filter(r => r.status === "fulfilled") as Array<allSettled.PromiseResolution<oreg.OntologyInfo>>;
        const infos = settled.map(s  => s.value);
        setShowOntologyInfos(infos);
      }
    );
  }

  function closeOntologiesInfo(): void {
    setShowOntologyInfos(null);
  }

  function renderAnItem(anItem: AnItem): React.ReactElement {
    const anRecord = anItem.anRecord;
    const label = anModel.getLabel(anRecord);
    const visibility = activeItem === label ? "visible" : "hidden";

    function toggleShowFilesFlag(anItem: AnItem): void {
      const anl2 = annotations.map(a => _.isEqual(a, anItem) ? { ...a, showFilesFlag: !a.showFilesFlag } : a);
      setAnnotations(anl2);
    }
  
    function renderFilesBadge(): React.ReactElement {
      return (
        <React.Fragment>
          <span className="badge badge-secondary" style={{verticalAlign: "middle"}}
            data-toggle="tooltip" data-placement="bottom" title="Number of files with this annotation"
          >{anItem.targets.length}</span>
          <button type="button" 
            className="btn btn-sm btn-outline-primary list-action-button"
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
            className="btn btn-sm btn-outline-primary list-action-button mr-1"
            data-toggle="tooltip" data-placement="bottom" title="Edit"
            onClick={() => setEditedRecordId(anRecord.id)}
          ><EditIcon/>
          </button>
          <button type="button"
            className="btn btn-sm btn-outline-primary list-action-button"
            data-toggle="tooltip" data-placement="bottom" title="Delete"
            onClick={() => setPendingDeleteId(anRecord.id)}
          ><DeleteIcon/>
          </button>
        </React.Fragment>
      );
    }

    function renderTargets(): React.ReactElement {
      return (
        <table className="table mb-0">
          {anItem.targets.map(t =>
            <TargetTr key={t.source} context={props.context} target={t}/>)}
        </table>
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
              api.deleteAnnotation(pendingDeleteId, props.context).then(
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
            className="btn btn-sm btn-success"
            style={{marginLeft: "5px"}}
            onClick={() => setPendingDeleteId(null)}>
            No
          </button>
        </td>
      );
    }

    function renderNormalRow(): React.ReactElement {
      return (
        <React.Fragment>
          <tr onMouseOver={() => setActiveItem(label)} onMouseLeave={() => setActiveItem(null)}>
            <td style={{verticalAlign: "middle", whiteSpace: "nowrap"}}>
              <AnnotationTag 
                context={props.context}
                anRecord={anRecord}
                maxLen={14}
                onClick={() => loadOntologiesInfo(anRecord)}/>
            </td>
            <td style={{paddingLeft: 0}}>
              {renderFilesBadge()}
            </td>
            <td style={{whiteSpace: "nowrap", paddingLeft: 0, paddingRight: 0, visibility}}>
              {anRecord.creator.id === (props.context.user?.id || "") ? renderActionButtons() : ""}
            </td>
          </tr>
          {pendingDeleteId === anRecord.id ? 
            <tr>
              {renderDeleteConfirmation()}
            </tr> : ""}
          {anItem.showFilesFlag ? 
            <tr>
              <td colSpan={3} style={{borderTop: "none", paddingTop: 0}}>
                {renderTargets()}
              </td>
            </tr> : ""}
        </React.Fragment>
      );
    }
    
    function reload(): void {
      setEditedRecordId(null);
      if (loaderRef.current) { loaderRef.current.loadAnnotations(); }
    }

    return (
      <React.Fragment key={anRecord.id}>
        {anRecord.id === editedRecordId ?
          <TagEditor context={props.context} anRecord={anRecord} doneHandler={reload}/>
        : renderNormalRow()
        }
      </React.Fragment>
    );
  }

  function renderAnnotationsTable(): React.ReactElement {
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
    showOntologyInfos ?
      <InfoPanel 
        label={activeItem ? activeItem : ""}
        ontologyInfos={showOntologyInfos}
        closeFn={closeOntologiesInfo}
      />
    : renderAnnotationsTable()
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

