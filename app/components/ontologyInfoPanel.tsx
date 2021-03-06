import _ from "lodash";
import type { AppContext } from "app/context";
import * as React from "react";
import type { OntologyTerm } from "core/ontologyRegister";
import * as oApi from "../api/ontologyRegister";
import Paginator from "./paginator";
import SpinningWheel from "./spinningWheel";

export interface OntologyInfoRequest {
  label: string;
  uris: Array<string>;
}

interface Props {
  appContext: AppContext;
  infoRequest: OntologyInfoRequest;
  closeFn(): void;
}

export default function OntologyInfoPanel(props: Props): React.FunctionComponentElement<Props> {
  const [loading, setLoading] = React.useState(false);
  const [ontologyInfos, setOntologyInfos] = React.useState([] as Array<OntologyTerm>);
  const [activePage, setActivePage] = React.useState(1);

  React.useEffect(
    () => {
      setLoading(true);
      oApi.loadOntologiesInfo(props.appContext, props.infoRequest.uris).then(
        res => {
          setOntologyInfos(res);
          setLoading(false);
        },
        () => {
          setOntologyInfos([]);
          setLoading(false);
        }
      );
    },
    [props.infoRequest]
  );

  const rowCls = "border-bottom pb-1 mb-1";

  function renderHeading(): React.ReactElement {
    return (
      <>
        <div className={"d-flex flex-row pl-2 pr-2 pb-1 mb-2 bg-light"}>
          <strong className="mr-auto" style={{fontSize: "125%"}}>
            {props.infoRequest.label}
          </strong>
          <button type="button" className="ml-auto close"
            onClick={() => props.closeFn()}
          ><span>&times;</span>
          </button>
        </div>
        <div className="d-flex flex-row justify-content-center">
          <SpinningWheel show={loading}/>
        </div>
      </>
    );
  }

  function renderContents(): React.ReactElement {

    function renderTable(info: OntologyTerm): React.ReactElement {
      const lblStyle = "font-weight-bold mb-1";

      function renderList(lst: Array<string>|null): React.ReactElement {
        return (
          lst && lst.length > 0 ?
            lst.length === 1 ?
              <div>{lst[0]}</div>
             :
              <ul className="pl-4 m-0">
                {lst.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
          : <></>
        );
      }

      return (
        <div className="mb-2" style={{fontSize: "85%"}}>
          <div className={rowCls}>
            <div className={lblStyle}>Description:</div>
            {info.description}
          </div>
          <div className={rowCls}>
            <div className={lblStyle}>Short Form:</div>
            <div>{info.shortForm}</div>
          </div>
          <div className={rowCls}>
            <div className={lblStyle}>Ontology name:</div>
            <div>{info.ontologyName}</div>
          </div>
          <div className={rowCls}>
            <div className={lblStyle}>Ontology acronym:</div>
            <div>{info.ontologyAcronym}</div>
          </div>
          <div className={rowCls}>
            <div className={lblStyle}>Synonyms:</div>
            {renderList(info.synonyms)}
          </div>
          <div className={rowCls}>
            <div className={lblStyle}>URI:</div>
            <div><a href={info.uris}>{info.uris}</a></div>
          </div>
        </div>
      );
    }

    return (
      <div className="pl-2 pr-2">
        {!loading ?
          ontologyInfos.length > 0 ?
          renderTable(ontologyInfos[activePage - 1])
          : <span className="font-italic">No ontologies found</span>
          : <></>}
        <div className="ml-auto mr-auto">
          {ontologyInfos.length > 0 ?
            <Paginator maxPage={ontologyInfos.length} pageChangedFn={setActivePage}/>
            : <></>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderHeading()}
      {renderContents()}
    </div>
  );
}
