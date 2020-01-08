import { matchSwitch } from '@babakness/exhaustive-type-checking';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { FaEdit, FaList, FaSearch, FaQuestionCircle, FaSignInAlt } from "react-icons/fa";
import { Page } from "../pages/pages";
import { render as annotateRender } from "../pages/annotate/view";
import { render as annotationsRender } from "../pages/annotations/view";
import { render as searchRender } from "../pages/search/view";
import { HelpSection, render as helpRender } from "../pages/help/view";
import { render as profileRender } from "../pages/profile/view";
import { Context } from "../components/context";

let currentPage = Page.ANNOTATE;
let helpPage = Page.ANNOTATE;

function pageToHelp(page: Page): HelpSection {
  return matchSwitch(page, {
    [Page.ANNOTATE]: () => HelpSection.ANNOTATE,
    [Page.ANNOTATIONS]: () => HelpSection.ANNOTATIONS,
    [Page.SEARCH]: () => HelpSection.SEARCH,
    [Page.PROFILE]: () => HelpSection.PROFILE,
    [Page.HELP]: () => HelpSection.TOC // just for type exahaustivness, not used actually
  });  
}

function renderPage(page: Page, context: Context): void {
  return matchSwitch(page, {
    [Page.ANNOTATE]: () => annotateRender(context),
    [Page.ANNOTATIONS]: () => annotationsRender(context),
    [Page.SEARCH]: () => searchRender(context),
    [Page.HELP]: () => helpRender(pageToHelp(helpPage)),
    [Page.PROFILE]: () => profileRender(context)
  });
}

function switchPage(newPage: Page, context: Context): void {
  const node = document.getElementById("page");
  if (node) {
    ReactDOM.unmountComponentAtNode(node);
    renderPage(newPage, context);
    currentPage = newPage;
    helpPage = currentPage === Page.HELP ? helpPage : currentPage;
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
            className={"nav-link" + activeFlag(Page.ANNOTATE)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Annotate"
            onClick={() => pageSelected(Page.ANNOTATE)}
            ><FaEdit/>
          </a>
        </li>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(Page.ANNOTATIONS)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Annotations"
            onClick={() => pageSelected(Page.ANNOTATIONS)}
            ><FaList/>
          </a>
        </li>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(Page.SEARCH)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Search"
            onClick={() => pageSelected(Page.SEARCH)}
            ><FaSearch/>
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#"data-toggle="tooltip" 
             data-placement="bottom" title="Context Help"
            onClick={() => pageSelected(Page.HELP)}
          ><FaQuestionCircle/></a>
        </li>
        <li className="nav-item ml-auto">
          <a
            className={"nav-link" + activeFlag(Page.PROFILE)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Login"
            onClick={() => pageSelected(Page.PROFILE)}
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
    console.log(`Annotating pid="${context.target.pid}" source="${context.target.source}"`);
  } else {
    console.error("widget DOM element missing");
  }
}

