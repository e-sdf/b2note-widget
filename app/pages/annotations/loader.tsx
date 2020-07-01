import _ from "lodash";
import * as React from "react";
import * as icons from "../../components/icons";
import * as anModel from "../../core/annotationsModel";
import * as api from "../../api/annotations";
import type { Context } from "../../context";
import { showAlertError } from "../../components/ui"; 
import { downloadJSON, downloadRDF, downloadTurtle } from "../../components/download";

const alertId = "anlAlert";

// Prepared for target resolving:
// https://esciencedatalab.atlassian.net/browse/B2NT-137
// export interface ResolvedTarget {
//   target: anModel.AnTarget;
//   filename: string|null;
// }

export interface TagRecord {
  tag: string;
  anType: anModel.AnnotationType;
  annotations: Array<anModel.Annotation>;
  showAnnotationsFlag: boolean;
}

export interface TagMapIndex {
  tag: string;
  anType: anModel.AnnotationType;
}

type TagIndex = Record<string, Array<anModel.Annotation>>;

interface LoaderProps {
  context: Context;
  setTagRecordsFn: (tagTecords: Array<TagRecord>) => void;
  setLoaderFlagFn?: (flag: boolean) => void;
}

export interface LoaderInputHandles {
  loadAnnotations(): void;
}

// eslint-disable-next-line react/display-name
export const LoaderFilter = React.forwardRef((props: LoaderProps, ref: React.Ref<LoaderInputHandles>) => {
  const logged: boolean = props.context.mbUser !== null;
  const hasTarget: boolean = props.context.mbTarget !== null;
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

  React.useEffect(() => {
    setMineFilter(logged ? true : false);
    setOthersFilter(logged ? false : true);
  }, [props.context.mbUser]);

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

    function mkKey(tag: string, anType: anModel.AnnotationType): string {
      return tag + "_" + anType;
    }

    function groupByTag(anl: Array<anModel.Annotation>): [Array<string>, TagIndex] {
      const index = {} as TagIndex;
      const tags = new Set<string>();
      anl.forEach(
        an => {
          tags.add(anModel.getLabel(an));
          const tag = anModel.getLabel(an);
          const anType = anModel.getAnType(an);
          const key = mkKey(tag, anType);
          const ans = index[key];
          if (ans) {
            index[key] = [...ans, an];
          } else {
            index[key] = [an];
          }
        }
      );
      return [Array.from(tags), index];
    }

    function mkTagRecords(anl: Array<anModel.Annotation>): Array<TagRecord> {
      const [tags, tagIndex] = groupByTag(anl);
      return tags.reduce(
        (res, tag) => {
          const semantic = tagIndex[mkKey(tag, anModel.AnnotationType.SEMANTIC)];
          const keyword = tagIndex[mkKey(tag, anModel.AnnotationType.KEYWORD)];
          const comment = tagIndex[mkKey(tag, anModel.AnnotationType.COMMENT)];
          const semanticItem = semantic ?
            [{ 
              tag,
              anType: anModel.AnnotationType.SEMANTIC,
              annotations: semantic,
              showAnnotationsFlag: false
            }] : [];
          const keywordItem = keyword ?
            [{ 
              tag,
              anType: anModel.AnnotationType.KEYWORD,
              annotations: keyword,
              showAnnotationsFlag: false
            }] : [];
          const commentItem = comment ?
            [{ 
              tag,
              anType: anModel.AnnotationType.COMMENT,
              annotations: comment,
              showAnnotationsFlag: false
            }] : [];
            return [...res, ...semanticItem, ...keywordItem, ...commentItem];
        },
        [] as Array<TagRecord>
      );
    }

    if (!mbFilters) {
      setAnnotations([]);
      props.setTagRecordsFn([]);
    } else {
      if (props.setLoaderFlagFn) { props.setLoaderFlagFn(true); }
      api.getAnnotationsJSON(mbFilters, props.context.mbUser, props.context.mbTarget).then(
        anl => {
          if (props.setLoaderFlagFn) { props.setLoaderFlagFn(false); }
          setAnnotations(anl);
          const tagRecords = mkTagRecords(anl);
          props.setTagRecordsFn(tagRecords);
            // Prepared for target resolving:
            // https://esciencedatalab.atlassian.net/browse/B2NT-137
            // anl.map((an, ani) => {
            //   const targetsItem = targets[ani];
            //   const filenamePms = targetsItem.map(t => api.resolveSourceFilename(t.id));
            //   Promise.all(filenamePms).then(filenames => 
            //     props.setTagRecordss(anl.map(an2 => ({
            //       annotation: an2,
            //       resTargets: targetsItem.map((t, ti) => ({ target: t, filename: filenames[ti] })),
            //       showAnnotationsFlag: false
            //     })))
            //   );
            // });
            setNoOfMine(anl.filter(a => anModel.getCreatorId(a) === (props.context.mbUser?.profile.id || "")).length);
            setNoOfOthers(anl.filter(a => anModel.getCreatorId(a) !== (props.context.mbUser?.profile.id || "")).length);
            setNoOfSemantic(anl.filter(anModel.isSemantic).length);
            setNoOfKeyword(anl.filter(anModel.isKeyword).length);
            setNoOfComment(anl.filter(anModel.isComment).length);
          },
        error => { showAlertError(alertId, error); }
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

  function renderDownloadButton(): React.ReactElement {
    return (
      <div className="dropleft ml-auto">
        <button className="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id="anl-ddd" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <icons.DownloadIcon/>
        </button>
        <div className="dropdown-menu drop-down-menu-left" aria-labelledby="anl-ddd">
          <button type="button"
            className="dropdown-item"
            onClick={() => downloadJSON(annotations)}
          >Download JSON-LD</button>
          <button type="button"
            className="dropdown-item"
            onClick={() => downloadTurtle(annotations)}
          >Download RDF/Turtle</button>
          <button type="button"
            className="dropdown-item"
            onClick={() => downloadRDF(annotations)}
          >Download RDF/XML</button>
        </div>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
});
