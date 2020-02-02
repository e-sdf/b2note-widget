import _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Context } from "../../context";
import { Tabs, Tab } from "../../components/ui";
import * as anModel from "../../core/annotationsModel";
import { BasicSearch } from "./basicSearch";
import { AdvancedSearch } from "./advancedSearch";
import TargetTr from "../../components/targetTr";
import AnnotationTag from "../../components/annotationTag";
import { DownloadIcon } from "../../components/icons";
import { downloadJSON, downloadRDF } from "../../components/download";

type TabType = "basic" | "advanced";

interface SearchProps {
  context: Context;
}

export function SearchPage(props: SearchProps): React.FunctionComponentElement<SearchProps> {
  const [resultsBasic, setResultsBasic] = React.useState(null as Array<anModel.AnRecord>|null);
  const [resultsAdv, setResultsAdv] = React.useState(null as Array<anModel.AnRecord>|null);


  function renderDownloadButton(results: anModel.AnRecord[]): React.ReactElement {
    return (
      <div className="dropdown ml-auto">
        <button className="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id="anl-ddd" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <DownloadIcon/>
          <span> </span>
          Download Results
        </button>
        <div className="dropdown-menu" aria-labelledby="anl-ddd">
          <button type="button"
            className="dropdown-item"
            onClick={() => downloadJSON(results)}
          >Download JSON-LD</button>
          <button type="button"
            className="dropdown-item"
            onClick={() => downloadRDF(results)}
          >Download RDF/XML</button>
        </div>
      </div>
    );
  }

  function renderAnTags(anl: anModel.AnRecord[]): React.ReactElement {
    return (
      <>
        {anl.map((an, i) => 
          <tr key={i}>
            <td colSpan={2} style={{border: "none", padding: "0 0 0 0.5em"}}>
              <AnnotationTag anRecord={an} context={props.context} maxLen={35}/>
            </td>
          </tr>
        )}
      </>
    );
  }

  function renderResults(results: Array<anModel.AnRecord>): React.ReactElement {
    const resultsDict = _.groupBy(results, o => o.target.source);

    function renderItems(): React.ReactElement {
      return (
        <>
          <table className="table">
            {Object.keys(resultsDict).map(source => 
              <>
                {/*<TargetTr key={source} context={props.context} target={resultsDict[source][0].target}/>*/}
                {renderAnTags(resultsDict[source])}
              </>
            )}
          </table>
          {renderDownloadButton(results)}
        </>
      );
    }

    return (
      <div className="container-fluid">
        {results.length === 0 ? 
          <h3>No results</h3> 
          : 
          <>
            <h3>Results</h3>
            {renderItems()}
          </>
        }
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

