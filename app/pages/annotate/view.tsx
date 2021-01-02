import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import { printTableRange } from "core/annotationsModel";
import type { TargetInput, LinkTargetInput, TextSelectionTargetInput, ImageRegionOnPageTargetInput, TableTargetInput, PdfTargetInput } from "core/targetInput";
import { TargetInputType as TIT, printTargetInputType } from "core/targetInput";
import type { SysContext, AppContext } from "app/context";
import * as ac from "app/components/autocomplete";
import { Tabs, Tab } from "app/components/ui";
import type { OntologyInfoRequest } from "app/components/ontologyInfoPanel";
import OntologyInfoPanel from "app/components/ontologyInfoPanel";
import Semantic from "./semantic";
import Keyword from "./keyword";
import Comment from "./comment";

enum TabType { SEMANTIC = "semantic", KEYWORD = "keyword", COMMENT = "comment" }

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
}

export default function AnnotatePage(props: Props): React.FunctionComponentElement<Props> {
  const [activeTab, setActiveTab] = React.useState(TabType.SEMANTIC);
  const [semanticSuggestionStorage, setSemanticSuggestionStorage] = React.useState(null as ac.Suggestion|null);
  const [ontologyInfoRequest, setOntologyInfoRequest] = React.useState(null as OntologyInfoRequest|null);
  const mbTarget = props.sysContext.mbTarget;
  const mbUser = props.appContext.mbUser;

  function renderTargetInfo(): React.ReactElement {

    function renderTargetDetail(targetInput: TargetInput) {
      return matchSwitch(targetInput.type, {
        [TIT.PAGE]: () => <></>,
        [TIT.LINK]: () => {
          const t = targetInput as LinkTargetInput;
          return <a href={t.source} target="_blank" rel="noreferrer">{t.sourceName || t.source}</a>;
        },
        [TIT.TEXT_SELECTION]: () => {
          const t = targetInput as TextSelectionTargetInput;
          return <span style={{ backgroundColor: "yellow", fontSize: "90%" }}>{t.selectedText}</span>;
        },
        [TIT.IMAGE_REGION]: () => <></>,
        [TIT.IMAGE_REGION_ON_PAGE]: () => {
          const t = targetInput as ImageRegionOnPageTargetInput;
          return <a href={t.source} target="_blank" rel="noreferrer">{t.sourceName || t.source}</a>;
        },
        [TIT.TABLE]: () => {
          const t = targetInput as TableTargetInput;
          return (
            <>
              <span>Sheet: </span><span className="text-info">{t.sheet}</span><br/>
              {t.range ?
                <><span>Range: </span><span className="text-info">{printTableRange(t.range)}</span></>
              : <></>}
            </>
          );
        },
        [TIT.PDF]: () => {
          const t = targetInput as PdfTargetInput;
          return (
            <>
              <span>Page# </span>
              <span className="text-info">{t.pageNumber}</span>
              {t.svgSelector ? <span className="text-info"> (selection)</span> : <></>}
            </>
          );
        }
      });
    }

    return (
      <div className="card mt-2 ml-1 mr-1">
        <div className="card-header" style={{padding: "5px 10px"}}>
          <span>Annotation Target: </span>
          {!mbTarget ?
             <span className="text-danger">None</span>
           : <span className="text-info">{printTargetInputType(mbTarget)}</span>
          }
        </div>
        {mbTarget ?
          <div className="card-body" style={{padding: "5px 10px"}}>
          {renderTargetDetail(mbTarget)}
          </div>
        : <></>}
      </div>
    );
  }

  return (
    ontologyInfoRequest ?
      <div className="anl-table" style={{height: 462}}>
        <OntologyInfoPanel
          appContext={props.appContext}
          infoRequest={ontologyInfoRequest}
          closeFn={() => setOntologyInfoRequest(null)}/>
      </div>
    :
      <>
        {renderTargetInfo()}
        {mbUser && mbTarget ?
          <div style={{marginTop: "10px"}}>
            <Tabs key={activeTab} id="annotateTabs" activeTab={activeTab} activeHandle={setActiveTab}>
              <Tab tabId={TabType.SEMANTIC} title={<span>Semantic<br/>tag</span>}>
                <Semantic
                  sysContext={props.sysContext}
                  appContext={props.appContext}
                  suggestion={semanticSuggestionStorage}
                  setSuggestionHandler={setSemanticSuggestionStorage}
                  showInfoHandler={setOntologyInfoRequest}/>
              </Tab>
              <Tab tabId={TabType.KEYWORD} title={<span>Free-text<br/>keyword</span>}>
                <Keyword sysContext={props.sysContext} appContext={props.appContext}/>
              </Tab>
              <Tab tabId={TabType.COMMENT} title={<span>Comment<br/>&nbsp;</span>}>
                <Comment sysContext={props.sysContext} appContext={props.appContext}/>
              </Tab>
            </Tabs>
          </div>
          :
            mbUser ? <></> :
            <div className="container-fluid">
              <h3 className="text-danger">You need to log in to make annotations</h3>
            </div>}
      </>
  );
}
