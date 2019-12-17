import * as React from "react";
import * as ReactDOM from "react-dom";
import { Context } from "../../widget/context";
import { Tabs, Tab } from "../../components";
import * as anModel from "../../shared/annotationsModel";
import { BasicSearch } from "./basicSearch";
import { AdvancedSearch } from "./advancedSearch";
import { TargetTr } from "../view";

type TabType = "basic" | "advanced";

interface SearchProps {
  context: Context;
}

export function SearchPage(props: SearchProps): React.FunctionComponentElement<SearchProps> {
  const [resultsBasic, setResultsBasic] = React.useState(null as Array<anModel.AnRecord>|null);
  const [resultsAdv, setResultsAdv] = React.useState(null as Array<anModel.AnRecord>|null);

  function renderResults(results: Array<anModel.AnRecord>): React.ReactElement {

    function renderItems(res: Array<anModel.AnRecord>): React.ReactElement {
      return (
        <>
          <h3>Results</h3>
          <table className="table">
            {res.map(r => <TargetTr key={r.target.source} context={props.context} target={r.target}/>)}
          </table>
        </>
      );
    }

    return (
      <div className="container-fluid">
        {results.length === 0 ? <h3>No results</h3> : renderItems(results)}
      </div>
    );
  }

  return (
    <>
      <Tabs id="searchTabs" activeTab={"basic" as TabType}>
        <Tab tabId={"basic" as TabType} title="Basic Search">
          <div className="search-panel">
            <BasicSearch resultsHandle={setResultsBasic}/>
            {resultsBasic ? renderResults(resultsBasic) : ""}
          </div>
        </Tab>
        <Tab tabId={"advanced" as TabType} title="Advanced Search">
          <div className="search-panel">
            <AdvancedSearch resultsHandle={setResultsAdv}/>
            {resultsAdv ? renderResults(resultsAdv) : ""}
          </div>
        </Tab>
      </Tabs>
    </> 
  );
}

export function render(context: Context): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<SearchPage context={context}/>, container);
  } else {
    console.error("#page element missing");
  }
}

