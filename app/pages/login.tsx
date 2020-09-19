import * as React from "react";
import type { ConfRec } from "app/config";
import { AuthProvidersEnum } from "app/api/auth/defs";

interface Props {
  config: ConfRec;
  selectedHandler: (authProvider: AuthProvidersEnum) => void;
}

export default function AuthProviderSelectionPage(props: Props): React.FunctionComponentElement<Props> {
  return (
    <div className="container-fluid pt-2">
      <h2>Authenticate through:</h2>
      <div className="row mt-3 d-flex flex-row justify-content-center">
        <button className="btn btn-outline-primary"
          onClick={() => props.selectedHandler(AuthProvidersEnum.B2ACCESS)}>
          <img src={props.config.widgetServerUrl + props.config.imgPath + "b2access-logo.png"}/>
        </button>
      </div>
      <div className="row mt-3 d-flex flex-row justify-content-center">
        <button className="btn btn-outline-primary"
          onClick={() => props.selectedHandler(AuthProvidersEnum.OPEN_AIRE)}>
          <img src={props.config.widgetServerUrl + props.config.imgPath + "openaire-logo.png"}/>
        </button>
      </div>
    </div>
  );
}
