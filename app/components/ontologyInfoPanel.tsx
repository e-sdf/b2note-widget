import * as _ from "lodash";
import * as React from "react";
import type { Annotation } from "../core/annotationsModel";
import * as anModel from "../core/annotationsModel";
import type { OntologyInfo } from "../core/ontologyRegister";
import * as oApi from "../api/ontologies";
import Paginator from "./paginator";
import SpinningWheel from "./spinningWheel";

interface Props {
  annotation: Annotation;
  closeFn(): void;
}

export default function OntologyInfoPanel(props: Props): React.FunctionComponentElement<Props> {
  const [loading, setLoading] = React.useState(false);
  const [ontologyInfos, setOntologyInfos] = React.useState([] as Array<OntologyInfo>);
  const [activePage, setActivePage] = React.useState(1);

  React.useEffect(
    () => { 
      setLoading(true);
      oApi.loadOntologiesInfo(props.annotation).then(
        res => { 
          setOntologyInfos(res); 
          setLoading(false);
        }
      );
    },
    [props.annotation]
  );

  function renderTable(info: OntologyInfo): React.ReactElement {
    return (
      <table className="table" style={{fontSize: "85%"}}>
        <tbody>
          <tr>
            <th>Description:</th>
            <td>{(info.descriptions || []).map((d, i) => <span key={i}>{d}<br/></span>)}</td>
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
            <td>{info.synonyms.map((s, i) => 
              <span key={i}>
                {s}
                {s === _.last(info.synonyms) ? <></> : <br/>}
              </span>
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
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <strong className="mr-auto" style={{fontSize: "125%"}}>
              {anModel.getLabel(props.annotation)}
            </strong>
            <button type="button" className="ml-auto close"
              onClick={() => props.closeFn()}
            ><span>&times;</span>
            </button>
          </div>
        </div>
      </div>
      <div className="row justify-content-center">
        <SpinningWheel show={loading}/>
      </div>
      <div className="row">
        <div className="col">
          {!loading ?
            ontologyInfos.length > 0 ? 
            renderTable(ontologyInfos[activePage - 1])
            : "No ontologies found"
          : <></>}
        </div>
      </div>
      <div className="ml-auto mr-auto">
        {ontologyInfos.length > 0 ? 
          <Paginator maxPage={ontologyInfos.length} pageChangedFn={setActivePage}/>
          : <></>}
      </div>
    </>
  );
}
