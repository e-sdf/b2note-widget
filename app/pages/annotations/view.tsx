import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import * as an from "../../shared/annotation";
import * as api from "../../api/annotations";
import { Context } from "../../widget/context";
import { showAlertError } from "../../components"; 

const QuestionIcon = icons.FaQuestionCircle;
const AllFilesIcon = icons.FaCopy;
const MineIcon = icons.FaUser;
const OthersIcon = icons.FaUserFriends;
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

interface AnItem {
  anRecord: an.AnRecord;
  files: Array<string>;
  showFilesFlag: boolean;
}

export function Annotations(props: Props): React.FunctionComponentElement<{}> {
  const [allFilesFilter, setAllFilesFilter] = React.useState(false);
  const [mineFilter, setMineFilter] = React.useState(true);
  const [othersFilter, setOthersFilter] = React.useState(false);
  const [semanticFilter, setSemanticFilter] = React.useState(true);
  const [keywordFilter, setKeywordFilter] = React.useState(true);
  const [commentFilter, setCommentFilter] = React.useState(true);
  const [annotations, setAnnotations] = React.useState([] as Array<AnItem>);
  const [activeItem, setActiveItem] = React.useState(null as string|null);
  const [noOfMine, setNoOfMine] = React.useState(null as number|null);
  const [noOfOthers, setNoOfOthers] = React.useState(null as number|null);
  const [noOfSematic, setNoOfSemantic] = React.useState(null as number|null);
  const [noOfKeyword, setNoOfKeyword] = React.useState(null as number|null);
  const [noOfComment, setNoOfComment] = React.useState(null as number|null);

  function sort(ans: Array<an.AnRecord>): Array<an.AnRecord> {
    return _.sortBy(ans, (a) => an.getLabel(a));
  }
  
  React.useEffect(() => {
    const filters: api.Filters = { 
      allFilesFilter, 
      creatorFilter: [mineFilter, othersFilter],
      typeFilter: [semanticFilter, keywordFilter, commentFilter]
    };
    api.getAnnotations(props.context, filters).then(
      annotations => {
        const anl = sort(_.uniqBy(annotations, (a: an.AnRecord) => an.getLabel(a)));
        const filesPms = anl.map(a => api.getFiles(an.getLabel(a)));
        Promise.all(filesPms).then(files => {
          setAnnotations(anl.map((an, i) => ({ 
            anRecord: an,
            files: files[i],
            showFilesFlag: false
          })));
          setNoOfMine(annotations.filter(a => a.creator.id === props.context.user.id).length);
          setNoOfOthers(annotations.filter(a => a.creator.id !== props.context.user.id).length);
          setNoOfSemantic(annotations.filter(an.isSemantic).length);
          setNoOfKeyword(annotations.filter(an.isKeyword).length);
          setNoOfComment(annotations.filter(an.isComment).length);
        });
      },
      error => { console.log(error); showAlertError(alertId, "Failed getting annotations"); }
    );
  }, [allFilesFilter, mineFilter, othersFilter, semanticFilter, keywordFilter, commentFilter]);

  function toggleShowFilesFlag(anItem: AnItem): void {
    const anl2 = annotations.map(a => _.isEqual(a, anItem) ? { ...a, showFilesFlag: !a.showFilesFlag } : a);
    setAnnotations(anl2);
  }
  
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

    function renderCreatorSelection(): React.ReactElement {
      return (
        <div className="btn-group mr-2" role="group" aria-label="Creator Filter">
          <button type="button"
            className={`btn btn-${btnState(mineFilter)}secondary`}
            data-toggle="tooltip" data-placement="bottom" title={"My annotations" + (noOfMine ? ` (${noOfMine})` : "")}
            onClick={() => setMineFilter(!mineFilter)}
          ><MineIcon/></button>
          <button type="button"
            className={`btn btn-${btnState(othersFilter)}secondary`}
            data-toggle="tooltip" data-placement="bottom" title={"Other's annotations /displayed in italic/" + (noOfOthers ? ` (${noOfOthers})` : "")}
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
            data-toggle="tooltip" data-placement="bottom" title={"Sematic tags" + (noOfSematic ? ` (${noOfSematic})` : "")}
            onClick={() => setSemanticFilter(!semanticFilter)}
          ><SemanticIcon/></button>
          <button type="button"
            className={`btn btn-${btnState(keywordFilter)}secondary`}
            data-toggle="tooltip" data-placement="bottom" title={"Free-text keywords" + (noOfKeyword ? ` (${noOfKeyword})` : "")}
            onClick={() => setKeywordFilter(!keywordFilter)}
          ><KeywordIcon/></button>
          <button type="button"
            className={`btn btn-${btnState(commentFilter)}secondary`}
            data-toggle="tooltip" data-placement="bottom" title={"Comments" +  (noOfComment ? ` (${noOfComment})` : "")}
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
              {renderCreatorSelection()}
              {renderTypeSelection()}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  function renderAnListRow(): React.ReactElement {
    const shorten = (lbl: string, lng: number): string => lbl.length > lng ? lbl.substring(0, lng) + "..." : lbl;

    function renderAnItem(anItem: AnItem): React.ReactElement {
      const anRecord: an.AnRecord = anItem.anRecord;
      const label = an.getLabel(anRecord);

      function renderLabel(): React.ReactElement {
        const icon = 
          anRecord.motivation === an.PurposeType.COMMENTING ?
            <CommentIcon className="text-secondary"/> : 
            anRecord.body.items.find((i: an.AnItem) => i.type === an.BodyItemType.SPECIFIC_RESOURCE) ?
              <SemanticIcon className="text-secondary"/> : <KeywordIcon className="text-secondary"/>;
        const itemStyle = anRecord.creator.id === props.context.user.id ? {} : { fontStyle: "italic" };
        return (
          <React.Fragment>
            {icon}<span> </span>
            {shorten(label, 17) === label ? label :
              <span
                style={itemStyle}
                data-toggle="tooltip" data-placement="bottom" title={label}
              >{shorten(label, 17)}</span>}
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
              className="btn btn-sm btn-outline-secondary anl-action-button"
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
            ><DeleteIcon/>
            </button>
          </React.Fragment>
        );
      }

      function renderFiles(): React.ReactElement {
        return (
          <div>
            {anItem.files.map(f =>
              <div key={f}
                data-toggle="tooltip" data-placement="bottom" title={f}>
                <a href={f}>{shorten(f, 38)}</a>
              </div>)}
          </div>
        );
      }

      const visibility = activeItem === label ? "visible" : "hidden";
      return (
        <React.Fragment>
          <tr key={label} onMouseOver={() => setActiveItem(label)} onMouseLeave={() => setActiveItem(null)}>
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

export function render(context: Context): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<Annotations context={context}/>, container);
  } else {
    console.error("#page element missing");
  }
}

