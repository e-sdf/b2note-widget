import * as React from "react";
import type { SectionProps } from "./defs";

export function SupportSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {
  return (
    <>
      <h2>{props.header}</h2>
      <a href="https://www.eudat.eu/support-request" 
        target="_blank" rel="noopener noreferrer" className="btn btn-primary">Contact and request support</a>
    </>
  );
}

