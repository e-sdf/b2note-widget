import * as _ from "lodash";
import allSettled from "promise.allsettled";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import * as anModel from "../../shared/annotationsModel";
import * as api from "../../api/annotations";
import { Context } from "../../widget/context";
import { shorten } from "../pages";
import { showAlertSuccess, showAlertWarning, showAlertError } from "../../components"; 
import { LoaderFilter, AnItem } from "./loader";
import { TargetTr } from "../view";
import * as ac from "../../autocomplete/autocomplete";
import { SemanticAutocomplete } from "../../autocomplete/view";
import * as ontology from "./ontologyInfo";
import { SemanticIcon, KeywordIcon, CommentIcon } from "../icons";
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
  anRecord: anModel.AnRecord;
  doneHandler(): void;
}

function TagEditor(props: TagEditorProps): React.FunctionComponentElement<TagEditorProps> {
  const [uris, setUris] = React.useState([] as Array<string>);
  const [label, setLabel] = React.useState(anModel.getLabel(props.anRecord));
  const [ref, setRef] = React.useState(null as any);

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    setUris(suggestions[0].items.map((i: ac.Item) => i.uris));
    setLabel(suggestions[0].labelOrig);
  }

  function update(): void {
   const body = 
     anModel.isSemantic(props.anRecord) ?
       anModel.mkSemanticAnBody(uris, label)
     : anModel.isKeyword(props.anRecord) ?
       anModel.mkKeywordAnBody(label)
     : anModel.mkCommentAnBody(label);
    api.patchAnnotationBody(props.anRecord.id, body)
    .then(() => {
      showAlertSuccess(alertId, "Annotation updated");
      props.doneHandler();
    })
    .catch(error => {
      if (error.response.data && error.response.data.message) {
        showAlertWarning(alertId, error.response.data.message);
      } else {
        showAlertError(alertId, "Failed: server error");
      }
    });
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
            <SemanticAutocomplete 
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
  const [ontologyInfos, setOntologyInfos] = React.useState(null as Array<ontology.OntologyInfo>|null);

  function loadOntologiesInfo(anRecord: anModel.AnRecord): void {
    const iris = anModel.getSources(anRecord);
    const infoPms = iris.map((iri: string) => ontology.getInfo(iri));
    allSettled<ontology.OntologyInfo>(infoPms).then(
      (results) => {
        const settled = results.filter(r => r.status === "fulfilled") as Array<allSettled.PromiseResolution<ontology.OntologyInfo>>;
        const infos = settled.map(s  => s.value);
        setOntologyInfos(infos);
      }
    );
  }

  function closeOntologiesInfo(): void {
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
        const ontologiesNo = anModel.getSources(anRecord).length;
        return (
          <a
            href="#"
            style={itemStyle}
            data-toggle="tooltip" data-placement="bottom" 
            title={`${label} (present in ${ontologiesNo} ${ontologiesNo > 1 ? "ontologies" : "ontology"})`}
            onClick={() => loadOntologiesInfo(anRecord)}
            >{`${shortened} (${ontologiesNo})`}
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

    function renderNormalRow(): React.ReactElement {
      return (
        <React.Fragment>
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
          <TagEditor anRecord={anRecord} doneHandler={reload}/>
        : renderNormalRow()
        }
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

