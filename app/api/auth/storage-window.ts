import type { StoredAuth } from "./defs";
import type { StorageI } from "app/storage/defs";

const storageKey = "auth";

function storeAuthPm(sAuth: StoredAuth): Promise<void> {
  return new Promise((resolve) => {
    if (typeof(Storage) !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(sAuth));
      resolve();
    }
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

function deleteTokenPm(): Promise<void> {
  return new Promise((resolve) => {
    window.localStorage.removeItem(storageKey);
    resolve();
  });
}

export default {
  store: storeAuthPm,
  retrieve: retrieveStoredAuthPm,
  delete: deleteTokenPm
} as StorageI<StoredAuth>;
