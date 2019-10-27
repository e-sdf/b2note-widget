import * as _ from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { FaEdit, FaList, FaSearch, FaDownload, FaQuestionCircle, FaSignInAlt } from "react-icons/fa";
import { render as annotateRender } from "../pages/annotate/view";
import { render as annotationsRender } from "../pages/annotations/view";
import { render as searchRender } from "../pages/search/view";
import { render as profileRender } from "../pages/profile/view";
import { User } from "../api/profile";
import { Resource } from "../api/resource";
import { Context } from "./context";

type Page = "annotate" | "annotations" | "search" | "profile";

type SetPage = (p: Page) => any;

function renderPage(page: Page, context: Context) {
  switch (page) {
    case "annotate": annotateRender(context); break;
    case "annotations": annotationsRender(); break;
    case "search": searchRender(); break;
    case "profile": profileRender(); break;
    default: console.error(`page ${page} not found`); return null;
  }
}

var currentPage: Page = "annotate";

function switchPage(newPage: Page, context: Context) {
  const node = document.getElementById("page");
  if (node) {
    ReactDOM.unmountComponentAtNode(node);
    renderPage(newPage, context);
    currentPage = newPage;
  }
}

interface Props {
  context: Context;
}

function Navbar(props: Props): React.FunctionComponentElement<Context> {
  const [page, setPage] = React.useState(currentPage);
  const activeFlag = (p: Page): string => p === currentPage ? " active" : "";

  function pageSelected(p: Page) {
    setPage(p);
    switchPage(p, props.context);
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

function Widget(props: Props): React.FunctionComponentElement<Context> {
  return (
    <div>
      <img src="img/logo.png" width="100%"/>
      <Navbar context={props.context}/>
      <div id="page"></div>
    </div>
  );
}

export function render(context: Context) {
  const container = document.getElementById("widget");
  if (container) {
    ReactDOM.render(<Widget context={context}/>, container);
    switchPage(currentPage, context);
    console.log(`Logged user id="${context.user.id}" nickname="${context.user.nickname}"`);
    console.log(`Annotating pid="${context.resource.pid}" subject="${context.resource.subject}"`);
  } else {
    console.error("widget DOM element missing");
  }
}

