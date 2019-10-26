import * as React from "react";
import * as ReactDOM from "react-dom";

export function Search(): React.FunctionComponentElement<{}> {
  return (
    <div>
      Search
    </div>
  );
}

export function render() {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<Search/>, container);
  } else {
    console.error("#page element missing");
  }
}

