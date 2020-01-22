import { matchSwitch } from '@babakness/exhaustive-type-checking';
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "react-icons/fa";
import { Page } from "../pages/pages";
import { render as annotateRender } from "../pages/annotate/view";
import { render as annotationsRender } from "../pages/annotations/view";
import { render as searchRender } from "../pages/search/view";
import { HelpSection, render as helpRender } from "../pages/help/view";
import { render as profileRender } from "../pages/profile/view";
import { Context, isUserLogged } from "../components/context";
import { login } from "../api/auth";
import { shorten } from "../utils";

const AnnotateIcon = icons.FaEdit;
const AnnotationsIcon = icons.FaList;
const SearchIcon = icons.FaSearch;
const HelpIcon = icons.FaQuestionCircle;
const LoginIcon = icons.FaSignInAlt;
const UserIcon = icons.FaUser;

function pageToHelp(page: Page): HelpSection {
  return matchSwitch(page, {
    [Page.ANNOTATE]: () => HelpSection.ANNOTATE,
    [Page.ANNOTATIONS]: () => HelpSection.ANNOTATIONS,
    [Page.SEARCH]: () => HelpSection.SEARCH,
    [Page.PROFILE]: () => HelpSection.PROFILE,
    [Page.HELP]: () => HelpSection.TOC // just for type exahaustivness, not used actually
  });  
}

type RenderFn = () => void

type Renderer = (context: Context) => Promise<RenderFn>

interface Props {
  context: Context;
}

function Navbar(props: Props): React.FunctionComponentElement<Context> {
  const [page, setPage] = React.useState(Page.ANNOTATE);
  const [helpPage, setHelpPage] = React.useState(Page.ANNOTATE);
  const [context, setContext] = React.useState(props.context);

  const activeFlag = (p: Page): string => p === page ? " active" : "";

  async function profileLoggedRenderPm(): Promise<RenderFn> {
    if (isUserLogged(context)) {
      return Promise.resolve(() => profileRender(context));
    } else {
      const user = await login();
      console.log(user);
      const newContext = { ...context, user };
      setContext(newContext);
      return Promise.resolve(() => profileRender(newContext));
    }
  }

  function renderPage(): void {
    return matchSwitch(page, {
      [Page.ANNOTATE]: () => annotateRender(context),
      [Page.ANNOTATIONS]: () => annotationsRender(context),
      [Page.SEARCH]: () => searchRender(context),
      [Page.HELP]: () => helpRender(pageToHelp(helpPage)),
      [Page.PROFILE]: () => profileLoggedRenderPm().then((renderFn: RenderFn) => renderFn())
    });
  }

  function switchPage(p: Page): void {
    const node = document.getElementById("page");
    if (node) {
      ReactDOM.unmountComponentAtNode(node);
      renderPage();
      setHelpPage(p === Page.HELP ? helpPage : page);
    }
  }

  function pageSelected(p: Page): void {
    setPage(p);
    switchPage(p);
  }

  React.useEffect(() => switchPage(page));

  return (
    <nav className="navbar navbar-expand navbar-dark">
      <ul className="navbar-nav" style={{width: "100%"}}>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(Page.ANNOTATE)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Annotate"
            onClick={() => pageSelected(Page.ANNOTATE)}
            ><AnnotateIcon/>
          </a>
        </li>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(Page.ANNOTATIONS)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Annotations"
            onClick={() => pageSelected(Page.ANNOTATIONS)}
            ><AnnotationsIcon/>
          </a>
        </li>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(Page.SEARCH)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Search"
            onClick={() => pageSelected(Page.SEARCH)}
            ><SearchIcon/>
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#"data-toggle="tooltip" 
             data-placement="bottom" title="Context Help"
            onClick={() => pageSelected(Page.HELP)}
          ><HelpIcon/></a>
        </li>
        <li className="nav-item ml-auto">
          <a
            className={"nav-link" + activeFlag(Page.PROFILE)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title={context.user ? "Profile" : "Login"}
            onClick={() => pageSelected(Page.PROFILE)}>
            {context.user ? 
              <span><UserIcon/> {shorten(context.user.name, 15)}</span>
              : <LoginIcon/>
            }
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
    console.log(`Annotating pid="${context.target.pid}" source="${context.target.source}"`);
  } else {
    console.error("widget DOM element missing");
  }
}

