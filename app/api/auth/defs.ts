import type { Token } from "core/http";

export enum AuthProvidersEnum {
  KEYCLOAK= "keycloak",
  B2ACCESS = "b2access",
  OPEN_AIRE = "openaire"
}

export interface StoredAuth {
  token: Token;
  provider: AuthProvidersEnum;
}
