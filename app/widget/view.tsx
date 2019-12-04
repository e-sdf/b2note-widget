import * as React from "react";
import * as ReactDOM from "react-dom";
import { FaEdit, FaList, FaSearch, FaQuestionCircle, FaSignInAlt } from "react-icons/fa";
import { Page } from "../pages/pages";
import { render as annotateRender } from "../pages/annotate/view";
import { render as annotationsRender } from "../pages/annotations/view";
import { render as searchRender } from "../pages/search/view";
import { render as helpRender } from "../pages/help/view";
import { render as profileRender } from "../pages/profile/view";
import { Context } from "./context";

type SetPage = (p: Page) => any;

let currentPage: Page = "annotate";
let helpPage: Page = "annotate";

function renderPage(page: Page, context: Context): void {
  switch (page) {
    case "annotate": annotateRender(context); break;
    case "annotations": annotationsRender(context); break;
    case "search": searchRender(); break;
    case "help": helpRender(helpPage); break;
    case "profile": profileRender(); break;
    default: console.error(`page ${page} not found`); 
  }
}

function switchPage(newPage: Page, context: Context): void {
  const node = document.getElementById("page");
  if (node) {
    ReactDOM.unmountComponentAtNode(node);
    renderPage(newPage, context);
    currentPage = newPage;
    helpPage = currentPage === "help" ? helpPage : currentPage;
  }
}

interface Props {
  context: Context;
}

function Navbar(props: Props): React.FunctionComponentElement<Context> {
  const [page, setPage] = React.useState(currentPage);
  const activeFlag = (p: Page): string => p === page ? " active" : "";

  function pageSelected(p: Page): void {
    setPage(p);
    switchPage(p, props.context);
  }

  return (
    <nav className="navbar navbar-expand navbar-dark">
      <ul className="navbar-nav" style={{width: "100%"}}>
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
          <a className="nav-link" href="#"data-toggle="tooltip" 
             data-placement="bottom" title="Context Help"
            onClick={() => pageSelected("help")}
          ><FaQuestionCircle/></a>
        </li>
        <li className="nav-item ml-auto">
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

export function render(context: Context): void {
  const container = document.getElementById("widget");
  if (container) {
    ReactDOM.render(<Widget context={context}/>, container);
    switchPage(currentPage, context);
    console.log(`Logged user id="${context.user.id}" nickname="${context.user.nickname}"`);
    console.log(`Annotating pid="${context.resource.pid}" source="${context.resource.source}"`);
  } else {
    console.error("widget DOM element missing");
  }
}

