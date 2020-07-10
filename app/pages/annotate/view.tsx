import * as React from "react";
import * as ac from "../../components/autocomplete/view";
import { Tabs, Tab } from "../../components/ui";
import type { ApiComponent } from "../../components/defs";
import type { OntologyInfoRequest } from "../../components/ontologyInfoPanel";
import OntologyInfoPanel from "../../components/ontologyInfoPanel";
import { Semantic } from "./semantic";
import { Keyword } from "./keyword";
import { Comment } from "./comment";
import * as icons from "../../components/icons";

enum TabType { SEMANTIC = "semantic", KEYWORD = "keyword", COMMENT = "comment" }

export default function AnnotatePage(props: ApiComponent): React.FunctionComponentElement<ApiComponent> {
  const [activeTab, setActiveTab] = React.useState(TabType.SEMANTIC);
  const [semanticSuggestion, setSemanticSuggestion] = React.useState(null as ac.Suggestion|null);
  const [ontologyInfoRequest, setOntologyInfoRequest] = React.useState(null as OntologyInfoRequest|null);

  React.useEffect(() => console.log(semanticSuggestion), [semanticSuggestion]);

  function renderTargetInfo(): React.ReactElement {
    return (
      <div className="card">
        <div className="card-header" style={{padding: "5px 10px"}}>
          <span>Target </span>
          <span style={{fontStyle: "italic"}}
            data-toggle="tooltip" data-placement="bottom" title="PID is the URL of a landing page of the resource">
            &lt;PID&gt; <icons.HelpIcon/>
          </span>
          <span> and </span>
          <span style={{fontStyle: "italic"}}
            data-toggle="tooltip" data-placement="bottom" title="Source is the resource contents URL">
          &lt;Source&gt; <icons.HelpIcon/>
          </span>
        </div>
        <div className="card-body" style={{padding: "10px"}}>
          { props.context.mbTarget ?
            <>
              <input className="form-control" style={{fontSize: "85%", padding: "3px 6px"}} readOnly={true} 
                data-toggle="tooltip" data-placement="bottom" title={props.context.mbTarget?.pid || ""}
                value={props.context.mbTarget?.pid || ""}></input>
              <input className="form-control" style={{fontSize: "85%", padding: "3px 6px"}} readOnly={true}
                data-toggle="tooltip" data-placement="bottom" title={props.context.mbTarget?.source || ""}
                value={props.context.mbTarget?.source || ""}></input>
            </>
          : <h3 className="text-danger">No annotation target</h3>
          }
        </div>
      </div>
    );
  }

  return (
    ontologyInfoRequest ? 
      <div className="anl-table" style={{height: 462}}>
        <OntologyInfoPanel 
          infoRequest={ontologyInfoRequest}
          closeFn={() => setOntologyInfoRequest(null)}/>
      </div>
    :
      <>
        {renderTargetInfo()}
        {props.context.mbUser && props.context.mbTarget ?
          <div style={{marginTop: "10px"}}>
            <Tabs key={activeTab} id="annotateTabs" activeTab={activeTab} activeHandle={setActiveTab}> 
              <Tab tabId={TabType.SEMANTIC} title={<span>Semantic<br/>tag</span>}>
                <Semantic 
                  suggestion={semanticSuggestion}
                  setSuggestionHandler={setSemanticSuggestion}
                  showInfoHandler={setOntologyInfoRequest}
                  context={props.context}
                  authErrAction={props.authErrAction}/>
              </Tab>
              <Tab tabId={TabType.KEYWORD} title={<span>Free-text<br/>keyword</span>}>
                <Keyword context={props.context} authErrAction={props.authErrAction}/>
              </Tab>
              <Tab tabId={TabType.COMMENT} title={<span>Comment<br/>&nbsp;</span>}>
                <Comment context={props.context} authErrAction={props.authErrAction}/>
              </Tab>
            </Tabs>
          </div>
          : 
            props.context.mbUser ? <></> : 
            <div className="container-fluid">
              <h3 className="text-danger">You need to log in to make annotations</h3>
            </div>}
      </>
  );
}
