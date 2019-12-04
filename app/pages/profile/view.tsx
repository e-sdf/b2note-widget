import * as React from "react";
import * as ReactDOM from "react-dom";

export function ProfilePage(): React.FunctionComponentElement<{}> {
  return (
    <div>
      Profile
    </div>
  );
}

export function render(): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<ProfilePage/>, container);
  } else {
    console.error("#page element missing");
  }
}

