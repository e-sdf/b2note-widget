import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import * as an from "../../shared/annotation";
import * as api from "../../api/annotations";
import { showAlertError } from "../../components"; 

const QuestionIcon = icons.FaQuestionCircle;
const AllFilesIcon = icons.FaCopy;
const MineIcon = icons.FaUser;
const OthersIcon = icons.FaUserFriends;
const SemanticIcon = icons.FaCode;
const KeywordIcon = icons.FaQuoteRight;
const CommentIcon = icons.FaCommentDots;
const EditIcon = icons.FaEdit;
const DeleteIcon = icons.FaTimes;

const alertId = "anlAlert";

export function Annotations(): React.FunctionComponentElement<{}> {
  const [allFilesFilter, setAllFilesFilter] = React.useState(false);
  const [mineFilter, setMineFilter] = React.useState(true);
  const [othersFilter, setOthersFilter] = React.useState(false);
  const [semanticFilter, setSemanticFilter] = React.useState(true);
  const [keywordFilter, setKeywordFilter] = React.useState(true);
  const [commentFilter, setCommentFilter] = React.useState(true);
  const [annotations, setAnnotations] = React.useState([] as Array<an.AnRecord>);
  
  React.useEffect(() => {
    const filters: api.Filters = { 
      allFilesFilter, 
      ownerFilter: [mineFilter, othersFilter],
      typeFilter: [semanticFilter, keywordFilter, commentFilter]
    };
    api.getAnnotations(filters).then(
      annotations => setAnnotations(annotations),
      error => { console.log(error); showAlertError(alertId, "Failed getting annotations"); }
    );
  }, [allFilesFilter, mineFilter, othersFilter, semanticFilter, keywordFilter, commentFilter]);

  function renderLabel(): React.ReactElement {
    return (
      <div className="row">
        <div className="col-sm">
          <h5 className="mb-0 mt-1">
            Filters
            <span> </span>
            <QuestionIcon
              style={{fontSize: "80%", color: "#aaa", verticalAlign: "top", marginTop: "0.4em"}}
              data-toggle="tooltip" data-placement="bottom" title="Toggle the buttons to switch a specific filter on/off"
            />
          </h5>
        </div>
      </div>
    );
  }

  function renderFiltersRow(): React.ReactElement {

    function btnState(state: boolean): string {
      return state ? "" : "outline-";
    }

    function renderFileSelection(): React.ReactElement {

      return (
        <div className="btn-group mr-2" role="group" aria-label="Files Filter">
          <button type="button"
            className={`btn btn-${btnState(allFilesFilter)}secondary`}
            data-toggle="tooltip" data-placement="bottom" title="All Files"
            onClick={() => setAllFilesFilter(!allFilesFilter)}
          ><AllFilesIcon/></button>
        </div>
      );
    }

    function renderOwnerSelection(): React.ReactElement {
      return (
        <div className="btn-group mr-2" role="group" aria-label="Owner Filter">
          <button type="button"
            className={`btn btn-${btnState(mineFilter)}secondary`}
            data-toggle="tooltip" data-placement="bottom" title="My annotations"
            onClick={() => setMineFilter(!mineFilter)}
          ><MineIcon/></button>
          <button type="button"
            className={`btn btn-${btnState(othersFilter)}secondary`}
            data-toggle="tooltip" data-placement="bottom" title="Other's annotations"
            onClick={() => setOthersFilter(!othersFilter)}
          ><OthersIcon/></button>
        </div>
      );
    }

    function renderTypeSelection(): React.ReactElement {
      return (
        <div className="btn-group" role="group" aria-label="Type Filter">
          <button type="button"
            className={`btn btn-${btnState(semanticFilter)}secondary`}
            data-toggle="tooltip" data-placement="bottom" title="Sematic tags"
            onClick={() => setSemanticFilter(!semanticFilter)}
          ><SemanticIcon/></button>
          <button type="button"
            className={`btn btn-${btnState(keywordFilter)}secondary`}
            data-toggle="tooltip" data-placement="bottom" title="Free-text keywords"
            onClick={() => setKeywordFilter(!keywordFilter)}
          ><KeywordIcon/></button>
          <button type="button"
            className={`btn btn-${btnState(commentFilter)}secondary`}
            data-toggle="tooltip" data-placement="bottom" title="Comments"
            onClick={() => setCommentFilter(!commentFilter)}
          ><CommentIcon/></button>
        </div>
      );
    }

    return (
      <React.Fragment>
        {renderLabel()}
        <div className="row mt-2">
          <div className="col-sm">
            <div className="btn-toolbar" role="toolbar" aria-label="Filters toolbar">
              {renderFileSelection()}
              {renderOwnerSelection()}
              {renderTypeSelection()}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  function renderAnListRow(): React.ReactElement {

    const shorten = (lbl: string): string => lbl.length > 14 ? lbl.substring(0, 14) + "..." : lbl;

    function renderAnItem(anRecord: an.AnRecord): React.ReactElement {
      const label = an.getLabel(anRecord);
      const icon = 
        anRecord.motivation === an.PurposeType.COMMENTING ?
          <CommentIcon/> : 
          anRecord.body.items.find((i: an.AnItem) => i.type === an.BodyItemType.SPECIFIC_RESOURCE) ?
            <SemanticIcon/> : <KeywordIcon/>;
      return (
        <tr key={label}>
          <td style={{whiteSpace: "nowrap"}}>
            {icon}<span> </span>
            {shorten(label) === label ? label :
              <span
                data-toggle="tooltip" data-placement="bottom" title={label}
              >{shorten(label)}</span>}
          </td>
          <td>
            <span className="badge badge-secondary">666</span>
          </td>
          <td style={{whiteSpace: "nowrap"}}>
            <button type="button"
              className="btn btn-sm btn-outline-primary mr-2"
              data-toggle="tooltip" data-placement="bottom" title="Edit"
            ><EditIcon/>
            </button>
            <button type="button"
              className="btn btn-sm btn-outline-primary"
              data-toggle="tooltip" data-placement="bottom" title="Delete"
            ><DeleteIcon/>
            </button>
          </td>
        </tr>
      );
    }
          
    return (
      <div className="row mt-2">
        <table className="table anl-table">
          <tbody>
            {annotations.map(anRecord => renderAnItem(anRecord))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="container-fluid">
          {renderFiltersRow()}
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

export function render(): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<Annotations/>, container);
  } else {
    console.error("#page element missing");
  }
}

