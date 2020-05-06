import axios from "axios";
import { endpointUrl, serverUrl } from "../config";
import type { UserProfile } from "../core/user";
import { axiosErrToMsg } from "../core/utils";
import { getUserProfilePm } from "./profile";

export type Token = string;

export interface AuthUser {
  token: Token;
  profile: UserProfile;
}

const storageKey = "token";

export function mkAuthHeader(token: string): Record<string, any> { 
  return { headers: { Authorization: "Bearer " + token } };
}

function storeTokenPm(token: Token): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof(Storage) !== "undefined") {
      window.localStorage.setItem(storageKey, token);
      resolve();
    }
  });
}

function deleteTokenPm(): Promise<void> {
  return new Promise((resolve, reject) => {
    window.localStorage.removeItem(storageKey);
    resolve();
  });
}

export function retrieveTokenPm(): Promise<Token> {
  return new Promise((resolve, reject) => {
    const token = window.localStorage.getItem(storageKey);
    if (!token) {
      reject();
    } else {
      resolve(token); 
    }
  });
}

export function loginPm(): Promise<AuthUser> {
  return new Promise((resolve, reject) => {
    let popup: Window|null = null;

    function receiveMessage(event: MessageEvent): void {
      if (event.source === popup) {
        popup?.close();
        window.removeEventListener("message", receiveMessage);
        try {
          const token = event.data as Token;
          //console.log("token:");
          //console.log(token);
          storeTokenPm(token).then(
            () => getUserProfilePm(token).then(
              profile => resolve({ token, profile }),
              err => reject(err)
            )
          );
        } catch (err) { reject("Error parsing user object: " + err); }
      }
    }

    function makeLogin(): void {
      popup = window.open(serverUrl + "/api/b2access/login", "B2ACCESS", "width=800");
      window.addEventListener("message", receiveMessage, false);
    }

    retrieveTokenPm().then(
      token => getUserProfilePm(token).then(
        profile => resolve({ token, profile }),
        () => makeLogin()
      ),
      () => makeLogin()
    );
  });
}

export function logoutPm(): Promise<any> {
  return new Promise((resolve, reject) => {
    retrieveTokenPm().then(
      token => deleteTokenPm().then(
        () => axios.get(endpointUrl + "/logout", mkAuthHeader(token))
          .then((resp) => resolve(resp))
          .catch(error => reject(axiosErrToMsg(error)))
      ),
      () => reject("Not logged in")
    );
  });
}