import * as React from "react";
import type { SectionProps } from "./defs";

export default function AboutSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {
  return (
    <>
      <h2>{props.header}</h2>
      <p>Welcome to the B2NOTE annotation service!</p>
      <p>
        Why annotating? Using B2NOTE you can add and manage extra information (&quot;annotations&quot;) about data files hosted by the <a href="https://b2share.eudat.eu" target="_blank" rel="noopener noreferrer">B2SHARE</a> service. Then use the annotations for finding files of interest and identifying new user-specific datasets.
      </p>
      <p>
        B2NOTE is currently designed as a crowdsourcing service which implies that all the annotations are accessible publicly. To guarantee on one side your privacy and on the other side to keep track of the origin of annotation records, you must authenticate using <a href="https://b2access.eudat.eu" target="_blank" rel="noopener noreferrer">B2ACCESS</a>.
       </p>
    </>
  );
}
