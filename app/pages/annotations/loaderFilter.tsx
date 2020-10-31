import * as React from "react";
import * as icons from "app/components/icons";
import * as anModel from "core/annotationsModel";
import * as api from "app/api/annotations";
import type { SysContext, AppContext } from "app/context";
import AnDownloadButton from "app/components/anDownloader";
import SpinningWheel from "app/components/spinningWheel";
import Alert from "app/components/alert";

interface LoaderProps {
  sysContext: SysContext;
  appContext: AppContext;
  annotationsLoadedHandler: (anl: Array<anModel.Annotation>) => void;
}

export interface LoaderInputHandles {
  loadAnnotations(): void;
}

// eslint-disable-next-line react/display-name
export const LoaderFilter = React.forwardRef((props: LoaderProps, ref: React.Ref<LoaderInputHandles>) => {
  const mbTarget = props.sysContext.mbTarget;
  const mbUser = props.appContext.mbUser;
  const logged: boolean = mbUser !== null;
  const hasTarget: boolean = mbTarget !== null;
  const [allFilesFilter, setAllFilesFilter] = React.useState(hasTarget ? false : true);
  const [mineFilter, setMineFilter] = React.useState(logged ? true : false);
  const [othersFilter, setOthersFilter] = React.useState(logged ? false : true);
  const [semanticFilter, setSemanticFilter] = React.useState(true);
  const [keywordFilter, setKeywordFilter] = React.useState(true);
  const [commentFilter, setCommentFilter] = React.useState(true);
  const [annotations, setAnnotations] = React.useState([] as anModel.Annotation[]);
  const [noOfMine, setNoOfMine] = React.useState(null as number|null);
  const [noOfOthers, setNoOfOthers] = React.useState(null as number|null);
  const [noOfSemantic, setNoOfSemantic] = React.useState(null as number|null);
  const [noOfKeyword, setNoOfKeyword] = React.useState(null as number|null);
  const [noOfComment, setNoOfComment] = React.useState(null as number|null);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);

  React.useEffect(() => {
    setMineFilter(logged ? true : false);
    setOthersFilter(logged ? false : true);
  }, [mbUser]);

  const allFilters = [allFilesFilter, mineFilter, othersFilter, semanticFilter, keywordFilter, commentFilter];

  function mkFilters(): api.Filters|null {
    return (
      (mineFilter || othersFilter) && (semanticFilter || keywordFilter || commentFilter) ?
        {
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
        }
      : null
    );
  }

  function loadAnnotations(): void {
    const mbFilters = mkFilters();

    if (!mbFilters) {
      setAnnotations([]);
      props.annotationsLoadedHandler([]);
    } else {
      setLoading(true);
      api.getAnnotationsJSON(props.sysContext, props.appContext, mbFilters).then(
        anl => {
          setLoading(false);
          setAnnotations(anl);
          props.annotationsLoadedHandler(anl);
          setNoOfMine(anl.filter(a => anModel.getCreatorId(a) === (mbUser?.profile.id || "")).length);
          setNoOfOthers(anl.filter(a => anModel.getCreatorId(a) !== (mbUser?.profile.id || "")).length);
          setNoOfSemantic(anl.filter(a => anModel.isSemanticAnBody(a.body)).length);
          setNoOfKeyword(anl.filter(a => anModel.isKeywordAnBody(a.body)).length);
          setNoOfComment(anl.filter(a => anModel.isCommentAnBody(a.body)).length);
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  React.useImperativeHandle(ref, () => ({
    loadAnnotations
  }));

  React.useEffect(() => {
    loadAnnotations();
  }, allFilters);

  function renderLabel(): React.ReactElement {
    return (
      <div className="row">
        <div className="col-sm">
          <h5 className="mb-0 mt-1">
            Filters
            <span> </span>
            <icons.QuestionIcon
              style={{fontSize: "80%", color: "#aaa", verticalAlign: "top", marginTop: "0.4em"}}
              data-toggle="tooltip" data-placement="bottom" title="Toggle the buttons to switch a specific filter on/off"
            />
          </h5>
        </div>
      </div>
    );
  }

  function btnState(state: boolean): string {
    return state ? "btn-primary btn-filter-on" : "btn-outline-primary btn-filter-off";
  }

  function renderFileSelection(): React.ReactElement {
    return (
      <div className="btn-group" role="group" aria-label="Files Filter">
        <button type="button"
          className={`btn btn-sm ${btnState(allFilesFilter)}`}
          disabled={!hasTarget}
          data-toggle="tooltip" data-placement="bottom" title={ "All Files" + (hasTarget ? "" : " - fixed now, as no target is being annotated")}
          onClick={() => setAllFilesFilter(!allFilesFilter)}
        ><icons.AllFilesIcon/></button>
      </div>
    );
  }

  function renderCreatorSelection(): React.ReactElement {
    const notLoggedMsg = "You need to be logged in to switch this filter";
    return (
      <div className="btn-group ml-2" role="group" aria-label="Creator Filter">
        <button type="button"
          className={`btn btn-sm ${btnState(mineFilter)}`}
          disabled={!logged}
          data-toggle="tooltip" data-placement="bottom" title={logged ? "My annotations" + (noOfMine ? ` (${noOfMine})` : "") : notLoggedMsg}
          onClick={() => setMineFilter(!mineFilter)}
        ><icons.MineIcon/></button>
        <button type="button"
          className={`btn btn-sm ${btnState(othersFilter)}`}
          disabled={!logged}
          data-toggle="tooltip" data-placement="bottom" title={logged ? "Other's annotations (displayed in italic)" + (noOfOthers ? ` (${noOfOthers})` : "") : notLoggedMsg}
          onClick={() => setOthersFilter(!othersFilter)}
        ><icons.OthersIcon/></button>
      </div>
    );
  }

  function renderTypeSelection(): React.ReactElement {
    return (
      <div className="btn-group ml-2" role="group" aria-label="Type Filter">
        <button type="button"
          className={`btn btn-sm ${btnState(semanticFilter)}`}
          data-toggle="tooltip" data-placement="bottom" title={"Semantic tags" + (noOfSemantic ? ` (${noOfSemantic})` : "")}
          onClick={() => setSemanticFilter(!semanticFilter)}
        ><icons.SemanticIcon/></button>
        <button type="button"
          className={`btn btn-sm ${btnState(keywordFilter)}`}
          data-toggle="tooltip" data-placement="bottom" title={"Free-text keywords" + (noOfKeyword ? ` (${noOfKeyword})` : "")}
          onClick={() => setKeywordFilter(!keywordFilter)}
        ><icons.KeywordIcon/></button>
        <button type="button"
          className={`btn btn-sm ${btnState(commentFilter)}`}
          data-toggle="tooltip" data-placement="bottom" title={"Comments" +  (noOfComment ? ` (${noOfComment})` : "")}
          onClick={() => setCommentFilter(!commentFilter)}
        ><icons.CommentIcon/></button>
      </div>
    );
  }

  return (
    <>
      {renderLabel()}
      <div className="row mt-2">
        <div className="col-sm">
          <div className="d-flex flex-row justify-content-between" role="toolbar" aria-label="Filters toolbar">
            <div>
              {renderFileSelection()}
              {renderCreatorSelection()}
              {renderTypeSelection()}
            </div>
            <div className="">
              <AnDownloadButton config={props.sysContext.config} annotations={annotations}/>
            </div>
          </div>
        </div>
      </div>
      {loading || errorMessage ?
        <div className="row flex-row justify-content-center mt-4">
          <SpinningWheel show={loading}/>
          <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
        </div>
      : <></>}
    </>
  );
});
