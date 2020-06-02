import _ from "lodash";
import * as React from "react";
import type { Context } from "../../context";
import { Tabs, Tab } from "../../components/ui";
import * as anModel from "../../core/annotationsModel";
import { BasicSearch } from "./basicSearch";
import { AdvancedSearch } from "./advancedSearch";
import AnnotationTag from "../../components/annotationTag";
import TargetTr from "../../components/targetTr";
import InfoPanel from "../../components/infoPanel";
import { DownloadIcon } from "../../components/icons";
import { downloadJSON, downloadRDF } from "../../components/download";

type TabType = "basic" | "advanced";

interface SearchProps {
  context: Context;
}

export default function SearchPage(props: SearchProps): React.FunctionComponentElement<SearchProps> {
  const [resultsBasic, setResultsBasic] = React.useState(null as Array<anModel.AnRecord>|null);
  const [resultsAdv, setResultsAdv] = React.useState(null as Array<anModel.AnRecord>|null);
  const [ontologyInfoRequest, setOntologyInfoRequest] = React.useState(null as anModel.AnRecord|null);

  function clearResults(): void {
    setResultsBasic(null);
    setResultsAdv(null);
  }

  function closeOntologiesInfo(): void {
    setOntologyInfoRequest(null);
  }

  function renderDownloadButton(results: anModel.AnRecord[]): React.ReactElement {
    return (
      <div className="d-flex flex-row justify-content-center mt-2">
        <div className="dropdown">
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
      </div>
    );
  }

  function renderAnTags(anl: anModel.AnRecord[]): React.ReactElement {
    return (
      <>
        {anl.map((anRecord, i) => 
          <tr key={i}>
            <td colSpan={2} style={{border: "none", padding: "0 0 0 0.5em"}}>
              <AnnotationTag 
                anRecord={anRecord}
                mbUser={props.context.mbUser}
                maxLen={35}
                onClick={() => setOntologyInfoRequest(anRecord)}/>
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
          {Object.keys(resultsDict).map(source => 
            <li key={source} className="list-group-item pt-2 pl-0 pr-0 pb-2">
              <table className="table mb-2">
                <tbody>
                  {<TargetTr key={source} mbContextTarget={props.context.mbTarget} target={resultsDict[source][0].target}/>}
                  {renderAnTags(resultsDict[source])}
                </tbody>
              </table>
            </li>
          )}
        </>
      );
    }

    return (
      <>
        <div className="card">
          <div className="card-header" style={{padding: "5px 5px 5px 10px"}}>
            {results.length === 0 ? "No results" : "Targets found:"}
            <button type="button" className="ml-auto close"
              onClick={clearResults}
            ><span>&times;</span>
          </button>
          </div>
          { results.length > 0 ?
            <ul className="list-group list-group-flush" style={{padding: "10px", maxHeight: "372px", overflow: "auto"}}>
              {renderItems()}
            </ul>
            : <></>}
        </div>
        {renderDownloadButton(results)}
      </>
    );
  }

  function renderSearchInput(): React.ReactElement {
    return (
      <Tabs id="searchTabs" activeTab={"basic" as TabType}>
        <Tab tabId={"basic" as TabType} title="Basic Search">
          <BasicSearch resultsHandle={setResultsBasic}/>
        </Tab>
        <Tab tabId={"advanced" as TabType} title="Advanced Search">
          <AdvancedSearch resultsHandle={setResultsAdv}/>
        </Tab>
      </Tabs>
    );
  }

  return (
    <>
      {ontologyInfoRequest ?
        <InfoPanel 
          anRecord={ontologyInfoRequest}
          closeFn={closeOntologiesInfo}
        />
      : resultsBasic ? renderResults(resultsBasic) 
      : resultsAdv ? renderResults(resultsAdv)
      : renderSearchInput()}
    </>
  );
}
