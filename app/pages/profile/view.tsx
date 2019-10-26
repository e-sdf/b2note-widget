import * as React from "react";
import * as ReactDOM from "react-dom";

export function Profile(): React.FunctionComponentElement<{}> {
  return (
    <div>
      Profile
    </div>
  );
}

export function render() {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<Profile/>, container);
  } else {
    console.error("#page element missing");
  }
}

