import type { Token } from "../http";
import { get } from "../http";
import { AuthProvidersEnum } from "./defs";
import type { Context } from "app/context";
import { endpointUrl } from "app/config";

export function invalidateLoginPm(context: Context): Promise<void> {
  return context.authStorage.delete();
}

export function takeLoginPm(context: Context, provider: AuthProvidersEnum, servicesToken: Token): Promise<Token> {
  return new Promise((resolve, reject) =>
    get<Token>(endpointUrl + `/${provider}/take-login`, { token: servicesToken }).then(
      token =>
        context.authStorage.store({ provider, token }).then(
          () => resolve(token),
          err => reject(err)
      ),
      (err: any) => reject(err)
    )
  );
}

export function loginPm(context: Context, provider: AuthProvidersEnum, cancelHandler?: () => void): Promise<Token> {
  return new Promise((resolve, reject) => {
    let popup: Window|null = null;

    function receiveMessage(event: MessageEvent): void {
      if (event.source === popup) {
        window.removeEventListener("message", receiveMessage);
        popup?.close();
        if (event.data) {
          const token = event.data as Token;
          context.authStorage.store({ provider, token }).then(() => resolve(token));
        } else {
          reject();
        }
      }
    }

    popup = window.open(endpointUrl + `/${provider}/login`, "LOGIN", "width=800");
    popup?.addEventListener("unload", () => cancelHandler && cancelHandler());
    window.addEventListener("message", receiveMessage, false);
  });
}