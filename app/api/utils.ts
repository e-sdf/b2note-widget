import { serverUrl } from "../config";

export function makeLocalUrl(url: string): string {
  return url.replace("https://b2note.bsc.es", serverUrl);
}

export function authHeader(token: string): Record<string, any> { 
  return { headers: { Authorization: "Bearer " + token } };
}
