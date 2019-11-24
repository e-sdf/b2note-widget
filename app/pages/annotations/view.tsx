import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import * as anModel from "../../shared/annotationsModel";
import * as api from "../../api/annotations";
import { Context } from "../../widget/context";
import { showAlertError } from "../../components"; 
import { LoaderFilter, AnItem } from "./loader";

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

  function toggleShowFilesFlag(anItem: AnItem): void {
    const anl2 = annotations.map(a => _.isEqual(a, anItem) ? { ...a, showFilesFlag: !a.showFilesFlag } : a);
    setAnnotations(anl2);
  }
  
  function renderAnListRow(): React.ReactElement {
    const shorten = (lbl: string, lng: number): string => lbl.length > lng ? lbl.substring(0, lng) + "..." : lbl;

    function renderAnItem(anItem: AnItem): React.ReactElement {
      const anRecord: anModel.AnRecord = anItem.anRecord;
      const label = anModel.getLabel(anRecord);

      function renderLabel(): React.ReactElement {
        const icon = 
          anRecord.motivation === anModel.PurposeType.COMMENTING ?
            <CommentIcon className="text-secondary"/> : 
            anRecord.body.items.find((i: anModel.AnItem) => i.type === anModel.BodyItemType.SPECIFIC_RESOURCE) ?
              <SemanticIcon className="text-secondary"/> : <KeywordIcon className="text-secondary"/>;
        const itemStyle = anRecord.creator.id === props.context.user.id ? {} : { fontStyle: "italic" };
        const shortened = shorten(label, 17);
        return (
          <React.Fragment>
            {icon}<span> </span>
            {shortened === label ? 
              <span
                data-toggle="tooltip" data-placement="bottom" title={anRecord.id}>
                {label}
              </span>
              :
              <span
                style={itemStyle}
                data-toggle="tooltip" data-placement="bottom" title={label}>
                <span
                  data-toggle="tooltip" data-placement="bottom" title={anRecord.id}>
                  {shortened}
                </span>
              </span>}
          </React.Fragment>
        );
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

      const visibility = activeItem === label ? "visible" : "hidden";
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
          
    return (
      <div className="row mt-2">
        <table className="table anl-table">
          <tbody>
            {annotations.map(anItem=> renderAnItem(anItem))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="container-fluid">
        <LoaderFilter ref={loaderRef} context={props.context} setAnItems={setAnnotations}/>
        <div className="row mt-2">
          <div className="col-sm">
            <div id={alertId}></div>
          </div>
        </div>
        {renderAnListRow()}
      </div>
    </div>
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

