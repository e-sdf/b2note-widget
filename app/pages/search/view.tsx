import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import { Tabs, Tab } from "../../components";
import { TypeFilter } from "../../shared/annotationsModel";
import { OperatorType, SearchTerm, SearchQuery } from "../../shared/searchModel";
import * as anModel from "../../shared/annotationsModel";
import * as ac from "../../autocomplete/autocomplete";
import { SemanticAutocomplete } from "../../autocomplete/view";
import * as api from "../../api/annotations";
import { showAlertWarning, showAlertError } from "../../components"; 
import { BasicSearch } from "./basicSearch";
import { AdvancedSearch } from "./advancedSearch";

interface ResultsProps {
  results: Array<anModel.AnRecord>|null;
}

function Results(props: ResultsProps): React.FunctionComponentElement<ResultsProps> {
  return (
    <div>
      {props.results ? (
        props.results.length === 0 ? "No results" : props.results)
      : ""}
    </div>
  );

}

type TabType = "basic" | "advanced";

export function SearchPage(): React.FunctionComponentElement<{}> {
  const [resultsBasic, setResultsBasic] = React.useState(null as Array<anModel.AnRecord>|null);
  const [resultsAdv, setResultsAdv] = React.useState(null as Array<anModel.AnRecord>|null);

  return (
    <>
      <Tabs id="searchTabs" activeTab={"basic" as TabType}>
        <Tab tabId={"basic" as TabType} title="Basic Search">
          <BasicSearch resultsHandle={setResultsBasic}/>
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

export function render(): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<SearchPage/>, container);
  } else {
    console.error("#page element missing");
  }
}

