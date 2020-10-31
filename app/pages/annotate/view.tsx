import * as React from "react";
import type { SysContext, AppContext } from "app/context";
import * as ac from "app/components/autocomplete";
import * as sel from "app/selection";
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
    const t = mbTarget;
    return (
      <div className="card mt-2">
        <div className="card-header" style={{padding: "5px 10px"}}>
          <span>Annotation Target: </span>
          {t && !t?.source && !t?.selection ? <span className="text-info">Whole page</span> : <></>}
          {!t ? <span className="text-danger">None</span> : <></>}
        </div>
        { t && (t.source || t.selection) ?
          <div className="card-body" style={{padding: "10px"}}>
            <>
              {t.source ?
                <a href={t.source} target="_blank">{t.source}</a>
              : <></>}
              {t.selection ?
                <span style={{backgroundColor: "yellow", fontSize: "90%"}}>{sel.toString(t.selection)}</span>
              :<></>}
            </>
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
