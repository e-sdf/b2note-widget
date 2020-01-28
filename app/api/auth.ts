import axios from "axios";
import { endpointUrl } from "../api/server";
import { authHeader } from "./utils";
import { UserProfile } from "../core/profile";

const storageKey = "user";

function storeUser(user: UserProfile): void {
  if (typeof(Storage) !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(user));
  }
}

function deleteUser(): void {
  window.localStorage.removeItem(storageKey);
}

export function retrieveUser(): UserProfile|null {
  const userStr = window.localStorage.getItem(storageKey);
  if (!userStr) {
    return null;
  } else {
    try {
      const user: UserProfile = JSON.parse(userStr);
      return user;
    } catch(err) { return null; }
  }
}

export function login(): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    let popup: Window|null = null;

    function receiveMessage(event: MessageEvent): void {
      if (event.source === popup) {
        popup?.close();
        window.removeEventListener("message", receiveMessage);
        try {
          const user = JSON.parse(event.data) as UserProfile;
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

export function logout(user: UserProfile): Promise<any> {
  deleteUser();
  return axios.get(endpointUrl + "/logout", authHeader(user.accessToken));
}