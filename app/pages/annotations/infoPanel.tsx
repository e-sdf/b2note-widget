import * as _ from "lodash";
import * as React from "react";
import * as icons from "react-icons/fa";
import * as anModel from "../../shared/annotationsModel";
import { OntologyInfo } from "../../shared/ontologyInfo";

const LeftIcon = icons.FaCaretLeft; 
const RightIcon = icons.FaCaretRight; 

interface Props {
  label: string;
  ontologyInfos: Array<OntologyInfo>;
  closeFn(): void;
}


export function InfoPanel(props: Props): React.FunctionComponentElement<Props> {
  const [activePage, setActivePage] = React.useState(1);

  function renderPaginator(): React.ReactElement {

    function renderGoLeft(): React.ReactElement {
      return (
        <li className="page-item">
          <a className="page-link" href="#" aria-label="Previous"
            onClick={() => setActivePage(Math.max(1, activePage - 1))}
          ><span aria-hidden="true"><LeftIcon/></span>
          </a>
        </li>
      );
    }

    function renderGoRight(): React.ReactElement {
      return (
        <li className="page-item">
          <a className="page-link" href="#" aria-label="Next"
            onClick={() => setActivePage(Math.min(props.ontologyInfos.length, activePage + 1))}
          ><span aria-hidden="true"><RightIcon/></span>
          </a>
        </li>
      );
    }

    function renderPage(n: number): React.ReactElement {
      const index = n + 1;
      const active = index === activePage ? " active" : "";
      return (
        <li key={index} className={"page-item" + active}>
          <a className="page-link" href="#"
            onClick={() => setActivePage(index)}
          >{index}</a>
        </li>
      );
    }

    return (
      <nav 
        style={{backgroundColor: "white"}} aria-label="Ontologies navigation">
        <ul 
          className="pagination pagination-sm justify-content-center flex-wrap"
          style={{margin: 0}}>
          {renderGoLeft()}
          {props.ontologyInfos.map((_, n) => renderPage(n))}
          {renderGoRight()}
        </ul>
      </nav>
    );
  }

  function renderTable(info: OntologyInfo): React.ReactElement {
    return (
      <table className="table" style={{fontSize: "85%"}}>
        <tbody>
          <tr>
            <th>Description:</th>
            <td>{info.description}</td>
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
        <div className="row">
          <div className="col-sm">
            {renderPaginator()}
          </div>
        </div>
      </div>
    </>
  );
}
