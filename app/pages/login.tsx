import * as React from "react";
import config from "../config";
import { AuthProvidersEnum } from "../api/auth";

interface Props {
  selectedHandler: (authProvider: AuthProvidersEnum) => void;
}

export default function AuthProviderSelectionPage(props: Props): React.FunctionComponentElement<Props> {
  return (
    <div className="container-fluid pt-2">
      <h2>Authenticate through:</h2>
      <div className="row mt-3 d-flex flex-row justify-content-center">
        <button className="btn btn-outline-primary"
          onClick={() => props.selectedHandler(AuthProvidersEnum.B2ACCESS)}>
          <img src={config.widgetServerUrl + config.imgPath + "b2access-logo.png"}/>
        </button>
      </div>
      <div className="row mt-3 d-flex flex-row justify-content-center">
        <button className="btn btn-outline-primary"
          onClick={() => props.selectedHandler(AuthProvidersEnum.OPEN_AIRE)}>
          <img src={config.widgetServerUrl + config.imgPath + "openaire-logo.png"}/>
        </button>
      </div>
    </div>
  );
}

