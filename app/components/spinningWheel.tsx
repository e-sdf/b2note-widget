import * as React from "react";

export interface SpinningWheelProps {
  show: boolean;
}

export default function SpinningWheel(props: SpinningWheelProps): React.FunctionComponentElement<SpinningWheelProps> {
  return (
    props.show ?
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    : <></>
  );
}
