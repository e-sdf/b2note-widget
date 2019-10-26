import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { FaEdit, FaList, FaSearch, FaDownload, FaQuestionCircle, FaSignInAlt } from "react-icons/fa";
import { render as annotateRender } from "../pages/annotate/view";
import { render as annotationsRender } from "../pages/annotations/view";
import { render as searchRender } from "../pages/search/view";
import { render as profileRender } from "../pages/profile/view";

type Page = "annotate" | "annotations" | "search" | "profile";

type SetPage = (p: Page) => any;

function pageReducer(page: Page) {
  switch (page) {
    case "annotate": return annotateRender; break;
    case "annotations": return annotationsRender; break;
    case "search": return searchRender; break;
    case "profile": return profileRender; break;
    default: console.error(`page ${page} not found`); return null;
  }
}

var currentPage: Page = "annotate";

function switchPage(newPage: Page) {
  const node = document.getElementById("page");
  const componentRenderer = pageReducer(newPage);
  if (node && componentRenderer) {
    ReactDOM.unmountComponentAtNode(node);
    componentRenderer();
    currentPage = newPage;
  }
}

function Navbar(): React.FunctionComponentElement<{}> {
  const [page, setPage] = React.useState(currentPage);
  const activeFlag = (p: Page): string => p === currentPage ? " active" : "";

  function pageSelected(p: Page) {
    setPage(p);
    switchPage(p);
  }

  return (
    <nav className="navbar navbar-expand navbar-dark">
      <ul className="navbar-nav">
	<li className="nav-item">
	  <a
            className={"nav-link" + activeFlag("annotate")} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Annotate"
            onClick={() => pageSelected("annotate")}
            ><FaEdit/>
          </a>
	</li>
	<li className="nav-item">
	  <a
            className={"nav-link" + activeFlag("annotations")} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Annotations"
            onClick={() => pageSelected("annotations")}
            ><FaList/>
          </a>
	</li>
	<li className="nav-item">
	  <a
            className={"nav-link" + activeFlag("search")} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Search"
            onClick={() => pageSelected("search")}
            ><FaSearch/>
          </a>
	</li>
	<li className="nav-item">
	  <a className="nav-link" href="#"data-toggle="tooltip" data-placement="bottom" title="Help"><FaQuestionCircle/></a>
	</li>
	<li className="nav-item">
	  <a
            className={"nav-link" + activeFlag("profile")} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Login"
            onClick={() => pageSelected("profile")}
            ><FaSignInAlt/>
          </a>
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
    switchPage(currentPage);
  } else {
    console.error("widget DOM element missing");
  }
}

