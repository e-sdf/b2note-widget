import * as React from "react";
import * as ReactDOM from "react-dom";
import { Context } from "../../components/context";

type LogoutFn = () => void;

interface ProfileProps {
  context: Context;
  logoutFn: LogoutFn;
}

export function ProfilePage(props: ProfileProps): React.FunctionComponentElement<ProfileProps> {
  return (
    <div>
      <button type="button" className="btn btn-primary"
        onClick={() => props.logoutFn()}>
        Logout
      </button>
    </div>
  );
}

export function render(context: Context, logoutFn: LogoutFn): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<ProfilePage context={context} logoutFn={logoutFn}/>, container);
  } else {
    console.error("#page element missing");
  }
}

