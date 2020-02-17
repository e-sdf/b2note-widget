export function makeLocalUrl(url: string): string {
  return url.replace("https://b2note.bsc.es", "http://localhost:3050");
}

export function authHeader(token: string): Record<string, any> { 
  return { headers: { Authorization: "Bearer " + token } };
}
