import * as React from "react";
import type { SectionProps } from "./defs";
import { HelpSection } from "./defs";

export default function LoginSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {
  return (
    <>
      <h2>{props.header}</h2>

      <h3>Authentication mechanism</h3>
      <p>
        The B2NOTE user authentication is provided through third-party AAI providers. Currently the following providers are supported:
      </p>
      <ul>
        <li><a href="https://b2access.eudat.eu">B2ACCESS</a></li>
        <li><a href="https://www.openaire.eu">OpenAIRE</a> AAI</li>
      </ul>
      <p>
        After choosing a provider, a window for authenticating with the provider pops up; <span className="font-italic">Make sure your browser does not block popup windows.</span>
      </p>
      <p>
        During the authentication at a provider, you are required to create an account/log into the existing account. Also, you are given the option to check a checkbox that says something like &quot;Remember the settings for this service and do not show this dialog again&quot;. If you wish to use multiple accounts, it is advised not to check that checkbox.
      </p>

      <h3>After you are authenticated</h3>
      <p>
        Upon successful login you will be automatically logged in and redirected to the <a href="#" onClick={() => props.redirectFn(HelpSection.ANNOTATE)}>Annotate page</a>.
       </p>
      <p>
        After the first login, go to the <a href="#" onClick={() => props.redirectFn(HelpSection.PROFILE)}>Profile page</a> to fill in your profile information.
      </p>

      <h3>Session and its expiration</h3>
      <p>
        Your login information is stored in the browser&lsquo;s session storage in the form of a secure <a href="https://en.wikipedia.org/wiki/JSON_Web_Token">JSON Web Token</a>. This means that on your return to the widget, you are automatically logged in again until your tokens expires. Also, B2NOTE implements a re-login mechanism that logs you in again automatically in case you perform an authenticated operation (such as creating an annotation) and your token has expired.
      </p>
      <p>
        Please note that your session also expires at your authentication provider at some point. In this case, the automated re-login does not work and you need to log in again with the provider in a pop-up window. However, after a successful login, the started operation will continue automatically.
      </p>
      <p>
        In case your token expired or you wish to log in using a different provider, log out and repeat the process.
      </p>
    </>
  );
}