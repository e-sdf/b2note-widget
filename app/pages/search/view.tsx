import _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Context } from "../../components/context";
import { Tabs, Tab } from "../../components/ui";
import * as anModel from "../../core/annotationsModel";
import { BasicSearch } from "./basicSearch";
import { AdvancedSearch } from "./advancedSearch";
import TargetTr from "../../components/targetTr";
import { DownloadIcon } from "../../components/icons";

type TabType = "basic" | "advanced";

interface SearchProps {
  context: Context;
}

export function SearchPage(props: SearchProps): React.FunctionComponentElement<SearchProps> {
  const [resultsBasic, setResultsBasic] = React.useState(null as Array<anModel.AnRecord>|null);
  const [resultsAdv, setResultsAdv] = React.useState(null as Array<anModel.AnRecord>|null);

  function renderDownloadButton(): React.ReactElement {
    return (<></>
  //     <div className="dropdown ml-auto">
  //       <button className="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id="anl-ddd" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
  //         <DownloadIcon/>
  //       </button>
  //       <div className="dropdown-menu" aria-labelledby="anl-ddd">
  //         <button type="button"
  //           className="dropdown-item"
  //           onClick={downloadJSON}
  //         >Download JSON-LD</button>
  //         <button type="button"
  //           className="dropdown-item"
  //           onClick={downloadRDF}
  //         >Download RDF/XML</button>
  //       </div>
  //     </div>
    );
  }

  function renderItems(res: Array<anModel.AnRecord>): React.ReactElement {
    return (
      <>
        <h3>Results</h3>
        <table className="table">
          {res.map(r => <TargetTr key={r.target.source} context={props.context} target={r.target}/>)}
        </table>
        {renderDownloadButton()}
      </>
    );
  }

  function renderResults(results: Array<anModel.AnRecord>): React.ReactElement {
    const filesDict = _.groupBy(results, o => o.target.source);
    console.log(filesDict);
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

