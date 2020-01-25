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
    <div className="container-fluid mt-2" style={{height: "450px", overflow: "auto"}}>
      <form>
        <div className="form-group">
          <label>Name</label>
          <input type="text" className="form-control"/>
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <input type="email" className="form-control"/>
        </div>
        <div className="form-group">
          <label>Organisation</label>
          <input type="text" className="form-control"/>
        </div>
        <div className="form-group">
          <label>Job Title</label>
          <input type="text" className="form-control"/>
        </div>
        <div className="form-group">
          <label>Country</label>
          <input type="text" className="form-control"/>
        </div>
        <div className="form-group">
          <label>Annotator Experience</label>
          <input type="text" className="form-control"/>
        </div>
      </form>
      <div className="row">
        <button type="button" className="btn btn-primary"
          onClick={() => props.logoutFn()}>
          Logout
        </button>
      </div>
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

