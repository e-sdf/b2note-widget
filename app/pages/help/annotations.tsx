import * as React from "react";
import type { SectionProps } from "./defs";

export function AnnotationsSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {
  return (
    <>
      <h2>{props.header}</h2>
      <p>
        Vestibulum libero magna, volutpat sit amet lorem id, dignissim lobortis tortor. Nullam accumsan vel lacus ac faucibus. Morbi dignissim rhoncus massa. Nam sit amet hendrerit nisi, nec varius mauris. Duis bibendum nisl vulputate rhoncus tincidunt. Vivamus efficitur facilisis quam, id aliquam massa fringilla ut. Nunc a tellus nec tellus fringilla accumsan sed sed sapien. Mauris id elementum turpis. In consectetur sodales tortor eget ultrices. Maecenas eget ex quam. Donec vel ligula tempor, posuere lectus non, auctor nulla.
      </p>
    </>
  );
}

