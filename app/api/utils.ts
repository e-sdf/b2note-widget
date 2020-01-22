export function authHeader(token: string): Record<string, any> { 
  return { headers: { Authorization: "Bearer " + token } };
}

