import * as _ from "lodash";
import * as React from "react";
import * as icons from "../../components/icons";
import { Paginator } from "../../components/paginator";
import type { OntologyInfo } from "../../core/ontologyRegister";

interface Props {
  label: string;
  ontologyInfos: Array<OntologyInfo>;
  closeFn(): void;
}

export function InfoPanel(props: Props): React.FunctionComponentElement<Props> {
  const [activePage, setActivePage] = React.useState(1);

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
                {s === _.last(info.synonyms) ? "" : <br/>}
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
      <div className="container-fluid">
        <div className="row">
          <button type="button" className="ml-auto mr-3 close"
            onClick={() => props.closeFn()}
          ><span>&times;</span>
          </button>
        </div>
      </div>
      <div className="container-fluid anl-ontology-pane">
        <div className="row">
          <div className="col-sm">
            <strong className="mr-auto" style={{fontSize: "125%"}}>
              {props.label}
            </strong>
          </div>
        </div>
        <div className="row">
          <div className="col-sm">
            {renderTable(props.ontologyInfos[activePage - 1])}
          </div>
        </div>
        <div className="row d-flex flex-row justify-content-center">
          <Paginator maxPage={props.ontologyInfos.length} pageChangedFn={setActivePage}/>
        </div>
      </div>
    </>
  );
}
