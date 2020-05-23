import type { Token } from "./http";
import { serverUrl } from "../config";

export type AuthPm = Promise<void>;

const storageKey = "token";

function storeTokenPm(token: Token): Promise<void> {
  return new Promise((resolve) => {
    if (typeof(Storage) !== "undefined") {
      window.localStorage.setItem(storageKey, token);
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

export function invalidateLoginPm(): Promise<void> {
  return deleteTokenPm();
}

export function loginPm(relogin = false): Promise<Token> {
  return new Promise((resolve, reject) => {
    let popup: Window|null = null;

    function receiveMessage(event: MessageEvent): void {
      if (event.source === popup) {
        popup?.close();
        window.removeEventListener("message", receiveMessage);
        try {
          const token = event.data as Token;
          storeTokenPm(token).then(() => resolve(token));
        } catch (err) { reject("Error parsing user object: " + err); }
      }
    }

    function openLogin(): void {
      popup = window.open(serverUrl + "/api/b2access/login", "B2ACCESS", "width=800");
      window.addEventListener("message", receiveMessage, false);
    }

    if (relogin) {
      openLogin();
    } else {
      retrieveTokenPm().then(
        token => resolve(token),
        () => openLogin()
      );
    }
  });
}