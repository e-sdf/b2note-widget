import * as React from "react";
import * as ReactDOM from "react-dom";
import { FaPlus } from "react-icons/fa";
import { Tabs, Tab } from "../../components";
import { SemanticAutocomplete } from "../../autocomplete/view";
import * as ac from "../../autocomplete/autocomplete";
import * as rq from "../../api/request";
import { Resource } from "../../api/resource";
import { Context } from "../../widget/context";

type Tabs = "semantic" | "keyword" | "comment";

interface Props {
  context: Context;
}

function Semantic(props: Props): React.FunctionComponentElement<Context> {
  const [uris, setUris] = React.useState([] as Array<string>);

  function gotSuggestion(suggestions: Array<ac.Suggestion>) {
    setUris(suggestions[0].items.map((i: ac.Item) => i.uris));
  }

  function annotate() {
    const body: rq.AnBody = rq.mkBody(uris);
    const target: rq.AnTarget = rq.mkTarget({
      id: props.context.resource.pid, 
      source: props.context.resource.subject
    });
    const creator: rq.AnCreator = rq.mkCreator({
      id: props.context.user.id, 
      nickname: props.context.user.nickname
    });
    const generator: rq.AnGenerator = rq.mkGenerator();
    const req: rq.AnnotateReq = rq.mkRequest(body, target, creator, generator);
    console.log(req);
  }

  return (
    <div className="b2-container d-flex flex-row">
      <SemanticAutocomplete onChange={gotSuggestion}/>
      <button type="button" className="btn btn-primary"
	onClick={annotate}
      ><FaPlus/></button>
    </div>
  );
}

function Keyword(): React.FunctionComponentElement<{}> {
  return (
    <div className="b2-container d-flex flex-row">
      <input className="form-control"/>
      <button type="button" className="btn btn-primary"><FaPlus/></button>
    </div>
  );
}

function Comment(): React.FunctionComponentElement<{}> {
  return (
    <div className="b2-container d-flex flex-row">
      <textarea className="form-control"/>
      <button type="button" className="btn btn-primary"><FaPlus/></button>
    </div>
  );
}

export function Annotate(props: Props): React.FunctionComponentElement<Context> {
  return (
    <Tabs id="annotateTabs" activeTab={"semantic" as Tabs}>
      <Tab tabId={"semantic" as Tabs} title={<span>Semantic<br/>tag</span>}>
        <Semantic context={props.context}/>
      </Tab>
      <Tab tabId={"keyword" as Tabs} title={<span>Fee-text<br/>keyword</span>}>
        <Keyword/>
      </Tab>
      <Tab tabId={"comment" as Tabs} title={<span>Comment<br/>&nbsp;</span>}>
        <Comment/>
      </Tab>
    </Tabs>
  );
}

export function render(context: Context) {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<Annotate context={context}/>, container);
  } else {
    console.error("#page element missing");
  }
}

