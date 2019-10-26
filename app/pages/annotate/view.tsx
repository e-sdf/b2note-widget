import * as React from "react";
import * as ReactDOM from "react-dom";
import { FaPlus } from "react-icons/fa";
import { Tabs, Tab } from "../../components";
import { SemanticAutocomplete } from "../../autocomplete/view";

type Tabs = "semantic" | "keyword" | "comment";

function Semantic(): React.FunctionComponentElement<{}> {
  return (
    <div className="b2-container d-flex flex-row">
      <SemanticAutocomplete/>
      <button type="button" className="btn btn-primary"><FaPlus/></button>
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

export function Annotate(): React.FunctionComponentElement<{}> {
  return (
    <Tabs id="annotateTabs" activeTab={"semantic" as Tabs}>
      <Tab tabId={"semantic" as Tabs} title={<span>Semantic<br/>tag</span>}>
        <Semantic/>
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

export function render() {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<Annotate/>, container);
  } else {
    console.error("#page element missing");
  }
}

