import { endpointUrl } from "../api/server";
import { User } from "../core/profile";

export function login(): Promise<User> {
  return new Promise((resolve, reject) => {
    const popup = window.open(endpointUrl + "/login", "B2ACCESS", "width=800");

    function receiveMessage(event: MessageEvent): void {
      if (event.source === popup) {
        popup?.close();
        window.removeEventListener("message", receiveMessage);
        try {
          const user = JSON.parse(event.data) as User;
          resolve(user); 
        } catch(err) { reject("Error parsing user object: " + err); }
      }
    }
    window.addEventListener("message", receiveMessage, false);
  });
}