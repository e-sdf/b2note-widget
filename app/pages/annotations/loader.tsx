import * as React from "react";
import * as icons from "react-icons/fa";
import * as anModel from "../../core/annotationsModel";
import * as api from "../../api/annotations";
import { Context } from "../../components/context";
import { showAlertError } from "../../components/ui"; 
import { DownloadIcon } from "../../components/icons";
import { downloadJSON, downloadRDF } from "../../components/download";

const QuestionIcon = icons.FaQuestionCircle;
const AllFilesIcon = icons.FaCopy;
const MineIcon = icons.FaUser;
const OthersIcon = icons.FaUserFriends;
const SemanticIcon = icons.FaCode;
const KeywordIcon = icons.FaQuoteRight;
const CommentIcon = icons.FaCommentDots;

const alertId = "anlAlert";

export interface AnItem {
  anRecord: anModel.AnRecord;
  targets: Array<anModel.AnTarget>;
  showFilesFlag: boolean;
}

interface LoaderProps {
  context: Context;
  setAnItems: (anItems: Array<AnItem>) => void;
}

export interface LoaderInputHandles {
  loadAnnotations(): void;
}

// eslint-disable-next-line react/display-name
export const LoaderFilter = React.forwardRef((props: LoaderProps, ref: React.Ref<LoaderInputHandles>) => {
  const [allFilesFilter, setAllFilesFilter] = React.useState(false);
  const [mineFilter, setMineFilter] = React.useState(true);
  const [othersFilter, setOthersFilter] = React.useState(false);
  const [semanticFilter, setSemanticFilter] = React.useState(true);
  const [keywordFilter, setKeywordFilter] = React.useState(true);
  const [commentFilter, setCommentFilter] = React.useState(true);
  const [anRecords, setAnRecords] = React.useState([] as anModel.AnRecord[]);
  const [noOfMine, setNoOfMine] = React.useState(null as number|null);
  const [noOfOthers, setNoOfOthers] = React.useState(null as number|null);
  const [noOfSematic, setNoOfSemantic] = React.useState(null as number|null);
  const [noOfKeyword, setNoOfKeyword] = React.useState(null as number|null);
  const [noOfComment, setNoOfComment] = React.useState(null as number|null);

  function mkFilters(): api.Filters {
    return {
      allFiles: allFilesFilter, 
      creator: {
        mine: mineFilter,
        others: othersFilter
      },
      type: {
        semantic: semanticFilter,
        keyword: keywordFilter,
        comment: commentFilter
      }
    };
  }

  function loadAnnotations(): void {
    const filters = mkFilters();
    api.getAnnotationsJSON(props.context, filters).then(
      anl => {
        setAnRecords(anl);
        const targetsPms = anl.map(a => api.getTargets(anModel.getLabel(a)));
        Promise.all(targetsPms).then(targets => {
          props.setAnItems(anl.map((an, i) => ({ 
            anRecord: an,
            targets: targets[i],
            showFilesFlag: false
          })));
          setNoOfMine(anl.filter(a => a.creator.id === props.context.user.id).length);
          setNoOfOthers(anl.filter(a => a.creator.id !== props.context.user.id).length);
          setNoOfSemantic(anl.filter(anModel.isSemantic).length);
          setNoOfKeyword(anl.filter(anModel.isKeyword).length);
          setNoOfComment(anl.filter(anModel.isComment).length);
        });
      },
      error => { console.log(error); showAlertError(alertId, "Failed getting annotations"); }
    );
  }

  React.useImperativeHandle(ref, () => ({
    loadAnnotations
  }));
  
  React.useEffect(() => {
    loadAnnotations();
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

  function btnState(state: boolean): string {
    return state ? "" : "outline-";
  }

  function renderFileSelection(): React.ReactElement {
    return (
      <div className="btn-group" role="group" aria-label="Files Filter">
        <button type="button"
          className={`btn btn-sm btn-${btnState(allFilesFilter)}secondary`}
          data-toggle="tooltip" data-placement="bottom" title="All Files"
          onClick={() => setAllFilesFilter(!allFilesFilter)}
        ><AllFilesIcon/></button>
      </div>
    );
  }

  function renderCreatorSelection(): React.ReactElement {
    return (
      <div className="btn-group ml-2" role="group" aria-label="Creator Filter">
        <button type="button"
          className={`btn btn-sm btn-${btnState(mineFilter)}secondary`}
          data-toggle="tooltip" data-placement="bottom" title={"My annotations" + (noOfMine ? ` (${noOfMine})` : "")}
          onClick={() => setMineFilter(!mineFilter)}
        ><MineIcon/></button>
        <button type="button"
          className={`btn btn-sm btn-${btnState(othersFilter)}secondary`}
          data-toggle="tooltip" data-placement="bottom" title={"Other's annotations /displayed in italic/" + (noOfOthers ? ` (${noOfOthers})` : "")}
          onClick={() => setOthersFilter(!othersFilter)}
        ><OthersIcon/></button>
      </div>
    );
  }

  function renderTypeSelection(): React.ReactElement {
    return (
      <div className="btn-group ml-2" role="group" aria-label="Type Filter">
        <button type="button"
          className={`btn btn-sm btn-${btnState(semanticFilter)}secondary`}
          data-toggle="tooltip" data-placement="bottom" title={"Sematic tags" + (noOfSematic ? ` (${noOfSematic})` : "")}
          onClick={() => setSemanticFilter(!semanticFilter)}
        ><SemanticIcon/></button>
        <button type="button"
          className={`btn btn-sm btn-${btnState(keywordFilter)}secondary`}
          data-toggle="tooltip" data-placement="bottom" title={"Free-text keywords" + (noOfKeyword ? ` (${noOfKeyword})` : "")}
          onClick={() => setKeywordFilter(!keywordFilter)}
        ><KeywordIcon/></button>
        <button type="button"
          className={`btn btn-sm btn-${btnState(commentFilter)}secondary`}
          data-toggle="tooltip" data-placement="bottom" title={"Comments" +  (noOfComment ? ` (${noOfComment})` : "")}
          onClick={() => setCommentFilter(!commentFilter)}
        ><CommentIcon/></button>
      </div>
    );
  }

  function renderDownloadButton(): React.ReactElement {
    return (
      <div className="dropdown ml-auto">
        <button className="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id="anl-ddd" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <DownloadIcon/>
        </button>
        <div className="dropdown-menu" aria-labelledby="anl-ddd">
          <button type="button"
            className="dropdown-item"
            onClick={() => downloadJSON(anRecords)}
          >Download JSON-LD</button>
          <button type="button"
            className="dropdown-item"
            onClick={() => downloadRDF(anRecords)}
          >Download RDF/XML</button>
        </div>
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
            {renderDownloadButton()}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
});
