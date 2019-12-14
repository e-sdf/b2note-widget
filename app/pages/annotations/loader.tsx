import * as _ from "lodash";
import * as React from "react";
import * as icons from "react-icons/fa";
import * as anModel from "../../shared/annotationsModel";
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

const alertId = "anlAlert";

export interface AnItem {
  anRecord: anModel.AnRecord;
  files: Array<string>;
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
  const [noOfMine, setNoOfMine] = React.useState(null as number|null);
  const [noOfOthers, setNoOfOthers] = React.useState(null as number|null);
  const [noOfSematic, setNoOfSemantic] = React.useState(null as number|null);
  const [noOfKeyword, setNoOfKeyword] = React.useState(null as number|null);
  const [noOfComment, setNoOfComment] = React.useState(null as number|null);

  function sort(ans: Array<anModel.AnRecord>): Array<anModel.AnRecord> {
    return _.sortBy(ans, (a) => anModel.getLabel(a));
  }

  function loadAnnotations(): void {
    const filters: api.Filters = { 
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
    api.getAnnotations(props.context, filters).then(
      annotations => {
        const anl = sort(_.uniqBy(annotations, (a: anModel.AnRecord) => anModel.getLabel(a)));
        const filesPms = anl.map(a => api.getFiles(anModel.getLabel(a)));
        Promise.all(filesPms).then(files => {
          props.setAnItems(anl.map((an, i) => ({ 
            anRecord: an,
            files: files[i],
            showFilesFlag: false
          })));
          setNoOfMine(annotations.filter(a => a.creator.id === props.context.user.id).length);
          setNoOfOthers(annotations.filter(a => a.creator.id !== props.context.user.id).length);
          setNoOfSemantic(annotations.filter(anModel.isSemantic).length);
          setNoOfKeyword(annotations.filter(anModel.isKeyword).length);
          setNoOfComment(annotations.filter(anModel.isComment).length);
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
});
