import type { Token } from "./http";
import config from "../config";

const endpointUrl = config.apiServerUrl + config.apiPath;

export enum AuthProvidersEnum {
  B2ACCESS = "b2access",
  OPEN_AIRE = "openaire"
};

export type AuthPm = Promise<void>;

export interface StoredAuth {
  token: Token;
  provider: AuthProvidersEnum;
}

const storageKey = "token";

function storeAuthPm(sAuth: StoredAuth): Promise<void> {
  return new Promise((resolve) => {
    if (typeof(Storage) !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(sAuth));
      resolve();
    }
  });
}

function deleteTokenPm(): Promise<void> {
  return new Promise((resolve) => {
    window.localStorage.removeItem(storageKey);
    resolve();
  });
}

export function retrieveStoredAuthPm(): Promise<StoredAuth> {
  return new Promise((resolve, reject) => {
    const sAuthStr = window.localStorage.getItem(storageKey);
    if (!sAuthStr) {
      reject("Storage empty");
    } else {
      try {
        const sAuth: StoredAuth = JSON.parse(sAuthStr);
        resolve(sAuth); 
      } catch(err) {
        reject("Stored auth parsing error" + JSON.stringify(err));
      }
    }
  });
}

export function invalidateLoginPm(): Promise<void> {
  return deleteTokenPm();
}

export function loginPm(provider: AuthProvidersEnum): Promise<Token> {
  return new Promise((resolve, reject) => {
    let popup: Window|null = null;

    function receiveMessage(event: MessageEvent): void {
      if (event.source === popup) {
        popup?.close();
        window.removeEventListener("message", receiveMessage);
        if (event.data) {
          const token = event.data as Token;
          storeAuthPm({ provider, token }).then(() => resolve(token));
        } else {
          reject();
        }
      }
    }

    popup = window.open(endpointUrl + `/${provider}/login`, "LOGIN", "width=800");
    window.addEventListener("message", receiveMessage, false);
  });
}