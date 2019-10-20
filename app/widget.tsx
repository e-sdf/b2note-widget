import * as React from "react";
import * as ReactDOM from "react-dom";
import { FaHome, FaSearch, FaDownload, FaQuestionCircle, FaSignInAlt } from "react-icons/fa";

function Navbar(): React.FunctionComponentElement<{}> {
  return (
    <nav className="navbar navbar-expand navbar-dark">
      <ul className="navbar-nav">
	<li className="nav-item">
	  <a className="nav-link" href="#" data-toggle="tooltip" data-placement="bottom" title="Home"><FaHome/></a>
	</li>
	<li className="nav-item">
	  <a className="nav-link" href="#"data-toggle="tooltip" data-placement="bottom" title="Search"><FaSearch/></a>
	</li>
	<li className="nav-item">
	  <a className="nav-link" href="#"data-toggle="tooltip" data-placement="bottom" title="Download annotations"><FaDownload/></a>
	</li>
	<li className="nav-item">
	  <a className="nav-link" href="#"data-toggle="tooltip" data-placement="bottom" title="Help"><FaQuestionCircle/></a>
	</li>
	<li className="nav-item">
	  <a className="nav-link" href="#"data-toggle="tooltip" data-placement="bottom" title="Log in"><FaSignInAlt/></a>
	</li>
      </ul>
    </nav>
  );
}

function Widget(): React.FunctionComponentElement<{}> {
  return (
    <div>
      <img src="img/logo.png" width="100%"/>
      <Navbar/>
      <div id="page"></div>
    </div>
  );
}

export function render() {
  const container = document.getElementById("widget");
  if (container) {
    ReactDOM.render(<Widget/>, container);
  } else {
    console.error("widget DOM element missing");
  }
}

