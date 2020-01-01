import * as React from "react";
import * as ReactDOM from "react-dom";
import { Context } from "../../components/context";

interface ProfileProps {
  context: Context;
}

export function ProfilePage(props: ProfileProps): React.FunctionComponentElement<ProfileProps> {
  return (
    <div>
      Profile
    </div>
  );
}

export function render(context: Context): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<ProfilePage context={context}/>, container);
  } else {
    console.error("#page element missing");
  }
}

