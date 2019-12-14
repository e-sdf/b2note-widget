import * as React from "react";
import * as ReactDOM from "react-dom";
import { Context } from "../../widget/context";
import { Tabs, Tab } from "../../components";
import * as anModel from "../../shared/annotationsModel";
import * as ac from "../../autocomplete/autocomplete";
import * as api from "../../api/annotations";
import { showAlertWarning, showAlertError } from "../../components"; 
import { BasicSearch } from "./basicSearch";
import { AdvancedSearch } from "./advancedSearch";

interface ResultsProps {
  results: Array<anModel.AnRecord>|null;
}

function Results(props: ResultsProps): React.FunctionComponentElement<ResultsProps> {
  const res = props.results;

  return (
    <div>
      {res ? (
        res.length === 0 ? "No results" 
        : res.map(r => r.target.source)
      ) : ""}
    </div>
  );

}

type TabType = "basic" | "advanced";

interface SearchProps {
  context: Context;
}

export function SearchPage(props: SearchProps): React.FunctionComponentElement<SearchProps> {
  const [resultsBasic, setResultsBasic] = React.useState(null as Array<anModel.AnRecord>|null);
  const [resultsAdv, setResultsAdv] = React.useState(null as Array<anModel.AnRecord>|null);

  React.useEffect(() => console.log(resultsBasic), [resultsBasic]);

  return (
    <>
      <Tabs id="searchTabs" activeTab={"basic" as TabType}>
        <Tab tabId={"basic" as TabType} title="Basic Search">
          <BasicSearch context={props.context} resultsHandle={setResultsBasic}/>
          <Results results={resultsBasic}/>
        </Tab>
        <Tab tabId={"advanced" as TabType} title="Advanced Search">
          <AdvancedSearch resultsHandle={setResultsAdv}/>
          <Results results={resultsAdv}/>
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

