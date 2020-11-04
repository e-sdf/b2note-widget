import * as React from "react";
import type { SysContext, AppContext } from "app/context";
import * as anModel from "core/annotationsModel";
import { Tabs, Tab } from "app/components/ui";
import AnList from "app/components/anList";
import { BasicSearch } from "./basicSearch";
import { AdvancedSearch } from "./advancedSearch";
import AnDownloadButton from "app/components/anDownloader";

type TabType = "basic" | "advanced";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
}

export default function SearchPage(props: Props): React.FunctionComponentElement<Props> {
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
                    <AnDownloadButton config={props.sysContext.config} annotations={results}/>
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
                sysContext={props.sysContext}
                appContext={props.appContext}
                annotations={results}
                displayTargets={true}
                ontologyInfoHandler={(visible) => setShowBanner(!visible)}/>
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
          <BasicSearch appContext={props.appContext} resultsHandle={setResultsBasic}/>
        </Tab>
        <Tab tabId={"advanced" as TabType} title="Advanced Search">
          <AdvancedSearch appContext={props.appContext} resultsHandle={setResultsAdv}/>
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
