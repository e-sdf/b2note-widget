import axios from "axios";
import { endpointUrl } from "../api/server";
import { authHeader } from "./utils";
import { User } from "../core/user";

const storageKey = "user";

function storeUser(user: User): void {
  if (typeof(Storage) !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(user));
  }
}

function deleteUser(): void {
  window.localStorage.removeItem(storageKey);
}

export function retrieveUser(): User|null {
  const userStr = window.localStorage.getItem(storageKey);
  if (!userStr) {
    return null;
  } else {
    try {
      const user: User = JSON.parse(userStr);
      return user;
    } catch(err) { return null; }
  }
}

export function login(): Promise<User> {
  return new Promise((resolve, reject) => {
    let popup: Window|null = null;

    function receiveMessage(event: MessageEvent): void {
      if (event.source === popup) {
        popup?.close();
        window.removeEventListener("message", receiveMessage);
        try {
          const user = JSON.parse(event.data) as User;
          storeUser(user);
          resolve(user);
        } catch (err) { reject("Error parsing user object: " + err); }
      }
    }

    const user = retrieveUser();
    if (user) {
      resolve(user);
    } else {
      popup = window.open(endpointUrl + "/login", "B2ACCESS", "width=800");
      window.addEventListener("message", receiveMessage, false);
    }
  });
}

export function logout(): Promise<any> {
  return new Promise((resolve, reject) => {
    const mbUser = retrieveUser();
    if (mbUser) {
      deleteUser();
      resolve(axios.get(endpointUrl + "/logout", authHeader(mbUser.accessToken)));
    } else {
      reject("Not logged in");
    }
  });
}