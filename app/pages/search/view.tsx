import _ from "lodash";
import * as React from "react";
import * as anModel from "core/annotationsModel";
import { Tabs, Tab } from "client/components/ui";
import type { ApiComponent } from "client/components/defs";
import AnList from "client/components/anList";
import { BasicSearch } from "./basicSearch";
import { AdvancedSearch } from "./advancedSearch";
import AnDownloadButton from "client/components/anDownloader";

type TabType = "basic" | "advanced";

export default function SearchPage(props: ApiComponent): React.FunctionComponentElement<ApiComponent> {
  const [resultsBasic, setResultsBasic] = React.useState(null as Array<anModel.Annotation>|null);
  const [resultsAdv, setResultsAdv] = React.useState(null as Array<anModel.Annotation>|null);
  const [showBanner, setShowBanner] = React.useState(true);

  function clearResults(): void {
    setResultsBasic(null);
    setResultsAdv(null);
  }

  function renderResults(results: Array<anModel.Annotation>): React.ReactElement {
    return (
      <>
        <div className="card">
          {showBanner ?
            <div className="card-header" style={{padding: "5px 5px 5px 10px"}}>
              <div className="d-flex flex-row justify-content-between">
                {results.length === 0 ?
                  <div className="font-italic">No results</div>
                :
                  <>
                    <div style={{padding: "4px 120px 0 0"}}>Results found:</div>
                    <AnDownloadButton config={props.context.config} annotations={results}/>
                  </>
                }
                <button type="button" className="ml-auto close" onClick={clearResults}>
                  <span>&times;</span>
                </button>
              </div>
            </div>
          : <></>
          }
          {results.length > 0 ?
            <div className="anl-table pt-1" style={{height: showBanner ? "415px" : "459px"}}>
              <AnList
                context={props.context}
                annotations={results}
                ontologyInfoHandler={(visible) => setShowBanner(!visible)}
                authErrAction={props.authErrAction}/>
            </div>
          : <></>}
        </div>
      </>
    );
  }

  function renderSearchInput(): React.ReactElement {
    return (
      <Tabs id="searchTabs" activeTab={"basic" as TabType}>
        <Tab tabId={"basic" as TabType} title="Basic Search">
          <BasicSearch solrUrl={props.context.config.solrUrl} resultsHandle={setResultsBasic}/>
        </Tab>
        <Tab tabId={"advanced" as TabType} title="Advanced Search">
          <AdvancedSearch solrUrl={props.context.config.solrUrl} resultsHandle={setResultsAdv}/>
        </Tab>
      </Tabs>
    );
  }

  return (
    <>
      {resultsBasic ? renderResults(resultsBasic)
      : resultsAdv ? renderResults(resultsAdv)
      : renderSearchInput()}
    </>
  );
}
