import * as React from "react";
import type { SectionProps } from "./defs";
import { HelpSection } from "./defs";

export function ProfileSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {
  return (
    <>
      <h2>{props.header}</h2>
      <p>
        When B2NOTE is loaded, a window for authenticating with B2ACCESS pops up. If your browser blocks such popup windows, you can click the button &quot;Login with B2ACCESS&quot; to open that window manually.
      </p>
      <p>
        During the authentication in B2ACCESS, you are given the option to check a checkbox that says &quot;Remember the settings for this service and do not show this dialog again&quot;. If you wish to use multiple accounts, it is advised not to check that checkbox.
      </p>
      <p>
        After the authentication with B2ACCESS, if it is your first time using B2NOTE, you will be asked some B2NOTE-specific information, such as your pseudonym that will be used to publish your annotations.
      </p>
      <p>
        Upon successful registration you will be automatically logged in and redirected to the <a href="#" onClick={() => props.redirectFn(HelpSection.ANNOTATE)}>Annotate page</a>.
       </p>
    </>
  );
}