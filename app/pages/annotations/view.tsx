import * as React from "react";
import * as ReactDOM from "react-dom";

export function Annotations(): React.FunctionComponentElement<{}> {
  return (
    <div>
      Annotations
    </div>
  );
}

export function render() {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<Annotations/>, container);
  } else {
    console.error("#page element missing");
  }
}

