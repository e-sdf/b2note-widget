import * as React from "react";
import * as ReactDOM from "react-dom";
import { Tabs, Tab } from "../../components/ui";
import type { Context } from "../../context";
import { Semantic } from "./semantic";
import { Keyword } from "./keyword";
import { Comment } from "./comment";

const alertId = "anAlert";

enum TabType { SEMANTIC = "semantic", KEYWORD = "keyword", COMMENT = "comment" }

interface PageProps {
  context: Context;
}

function AnnotatePage(props: PageProps): React.FunctionComponentElement<PageProps> {
  const [activeTab, setActiveTab] = React.useState(TabType.SEMANTIC);

  return (
    <>
      <Tabs key={activeTab} id="annotateTabs" activeTab={activeTab} activeHandle={setActiveTab}> 
        <Tab tabId={TabType.SEMANTIC} title={<span>Semantic<br/>tag</span>}>
          <Semantic context={props.context} alertId={alertId}/>
        </Tab>
        <Tab tabId={TabType.KEYWORD} title={<span>Free-text<br/>keyword</span>}>
          <Keyword context={props.context} alertId={alertId}/>
        </Tab>
        <Tab tabId={TabType.COMMENT} title={<span>Comment<br/>&nbsp;</span>}>
          <Comment context={props.context} alertId={alertId}/>
        </Tab>
      </Tabs>
      <div id={alertId}></div>
    </>
  );
}

export function render(context: Context): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<AnnotatePage context={context}/>, container);
  } else {
    console.error("#page element missing");
  }
}

