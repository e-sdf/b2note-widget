import * as React from "react";
import type { SectionProps } from "./defs";
import { HelpSection } from "./defs";

export default function ProfileSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {
  return (
    <>
      <h2>{props.header}</h2>
      <p>
        The profile page contains your personal B2NOTE information. Information available from the used authentication provider through OpenID is automatically retrieved. The information provided through OpenID differs across the providers, however e-mail is always retrieved and it is read-only in your profile. Please fill in the remaining information manually after your first login.
       </p>
      <p>
        Every user is uniquely identified by a generated, persistent and read-only B2NOTE ID. User&lsquo;s e-mail is retrieved through OpenID and is read-only. It also serves as additional profile identifier and is used to merge your profile across multiple authentication providers, i.e. if you used the same e-mail with B2ACCESS and OpenAIRE, this will result in one profile (and one B2NOTE ID). On the other hand, if you wish to have multiple identities in B2NOTE, you different e-mails in the authentication.
      </p>
    </>
  );
}