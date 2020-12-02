import * as React from "react";
import type { SysContext, AppContext } from "app/context";
import type { OntologyMeta } from "core/ontologyRegister";
import type { OntologySources } from "core/apiModels/ontologyQueryModel";
import { defaultOntologySources } from "core/apiModels/ontologyQueryModel";
import { getCustomOntologiesMetasPm } from "app/api/profile";
import SpinningWheel from "app/components/spinningWheel";
import Alert from "app/components/alert";
import * as icons from "app/components/icons";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
  sourcesSelectedHandler: (sources: OntologySources) => void;
}

export default function OntologySourcesPanel(props: Props): React.FunctionComponentElement<Props> {
  const [customOntologies, setCustomOntologies] = React.useState([] as Array<OntologyMeta>);
  const [sources, setSources] = React.useState(defaultOntologySources);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const mbUser = props.appContext.mbUser;

  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);

  React.useEffect(
    () => {
      if (mbUser) {
        setLoading(true);
        getCustomOntologiesMetasPm(props.sysContext.config, mbUser.token, props.appContext.authErrAction).then(
          ontologiesMetas => {
            setCustomOntologies(ontologiesMetas);
            setLoading(false);
          },
          err => { setLoading(false); setErrorMessage(err); }
        );
      }
    }, []
  );

  React.useEffect(
    () => props.sourcesSelectedHandler(sources),
    [sources]
  );

  function renderOntologies(): React.ReactElement {
    return (
      <>
        <div>
          <input type="checkbox" className="mr-1"
            checked={sources.solr}
            onChange={ev => setSources({
              ...sources,
              solr: ev.target.checked
            })}/>
          Central index
        </div>
        {customOntologies.map(o => 
          <div key={o.id}>
            <input type="checkbox" className="mr-1"
              checked={sources.custom.includes(o)}
              onChange={ev => setSources(
                ev.target.checked ? 
                  { ...sources, custom: [...sources.custom, o] }
                : { ...sources, custom: sources.custom.filter(o1 => o1.id !== o.id) }
                )
              }/>
            {o.name || o.uri}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="card">
      <div className="card-header p-2">
        Ontologies used
        <a href="https://b2note.bsc.es/app" target="_blank" rel="noreferrer"
          className="ml-2"
          data-toggle="tooltip" data-placement="bottom" title="Manage custom ontologies">
          <icons.ConfigureIcon/>
        </a>
      </div>
      <div className="card-body p-2" style={{height: 120, overflowY: "auto"}}>
        { loading ?
          <div className="d-flex flex-row justify-content-center mt-2">
            <SpinningWheel show={loading}/>
            <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
          </div>
        :
          renderOntologies()
        }
      </div>
    </div>
  );
}