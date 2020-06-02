import * as _ from "lodash";
import * as React from "react";
import type { AnRecord } from "../core/annotationsModel";
import * as anModel from "../core/annotationsModel";
import type { OntologyInfo } from "../core/ontologyRegister";
import * as oApi from "../api/ontologies";
import Paginator from "./paginator";
import SpinningWheel from "./spinningWheel";

interface Props {
  anRecord: AnRecord;
  closeFn(): void;
}

export default function InfoPanel(props: Props): React.FunctionComponentElement<Props> {
  const [loading, setLoading] = React.useState(false);
  const [ontologyInfos, setOntologyInfos] = React.useState([] as Array<OntologyInfo>);
  const [activePage, setActivePage] = React.useState(1);

  React.useEffect(
    () => { 
      setLoading(true);
      oApi.loadOntologiesInfo(props.anRecord).then(
        res => { 
          setOntologyInfos(res); 
          setLoading(false);
        }
      );
    },
    [props.anRecord]
  );

  function renderTable(info: OntologyInfo): React.ReactElement {
    return (
      <table className="table" style={{fontSize: "85%"}}>
        <tbody>
          <tr>
            <th>Description:</th>
            <td>{(info.descriptions || []).map(d => <>{d}<br/></>)}</td>
          </tr>
          <tr>
            <th>Short<br/>Form:</th>
            <td>{info.shortForm}</td>
          </tr>
          <tr>
            <th>Ontology<br/>name:</th>
            <td>{info.ontologyName}</td>
          </tr>
          <tr>
            <th>Ontology<br/>acronym:</th>
            <td>{info.ontologyAcronym}</td>
          </tr>
          <tr>
            <th>Synonyms</th>
            <td>{info.synonyms.map(s => 
              <>
                {s}
                {s === _.last(info.synonyms) ? <></> : <br/>}
              </>
              )}
            </td>
          </tr>
          <tr>
            <th>URI:</th>
            <td><a href={info.uris}>{info.uris}</a></td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <>
      <div className="container-fluid mt-2">
      </div>
      <div className="container-fluid anl-ontology-pane">
        <div className="row">
          <div className="col-sm">
            <strong className="mr-auto" style={{fontSize: "125%"}}>
              {anModel.getLabel(props.anRecord)}
            </strong>
          </div>
          <button type="button" className="ml-auto mr-1 close"
            onClick={() => props.closeFn()}
          ><span>&times;</span>
          </button>
        </div>
        <div className="row mt-2 justify-content-center">
            <SpinningWheel show={loading}/>
        </div>
        <div className="row">
          {!loading ?
            ontologyInfos.length > 0 ? 
            renderTable(ontologyInfos[activePage - 1])
            : "No ontologies found"
            : <></>}
        </div>
        <div className="row d-flex flex-row justify-content-center">
          {ontologyInfos.length > 0 ? 
            <Paginator maxPage={ontologyInfos.length} pageChangedFn={setActivePage}/>
            : <></>}
        </div>
      </div>
    </>
  );
}
