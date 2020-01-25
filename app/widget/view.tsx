import { matchSwitch } from '@babakness/exhaustive-type-checking';
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "../components/icons";
import { Page } from "../pages/pages";
import { render as annotateRender } from "../pages/annotate/view";
import { render as annotationsRender } from "../pages/annotations/view";
import { render as searchRender } from "../pages/search/view";
import { render as helpRender } from "../pages/help/view";
import { render as profileRender } from "../pages/profile/view";
import { HelpSection } from "../pages/help/defs";
import { Context, isUserLogged } from "../components/context";
import * as auth from "../api/auth";
import { shorten } from "../utils";

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
  const [context, setContext] = React.useState({ ...props.context, user: auth.retrieveUser() });

  const activeFlag = (p: Page): string => p === page ? " active" : "";

  function logout(): void {
    if (context.user) {
      auth.logout(context.user).then(() => {
        selectPage(Page.ANNOTATE);
        setContext({ ...context, user: null });
      })
    }
  }

  async function profileLoggedRenderPm(): Promise<RenderFn> {
    if (isUserLogged(context)) {
      return Promise.resolve(() => profileRender(context, logout));
    } else {
      const user = await auth.login();
      console.log(user);
      const newContext = { ...context, user };
      setContext(newContext);
      return Promise.resolve(() => profileRender(newContext, logout));
    }
  }

  function renderPage(p: Page): void {
    return matchSwitch(p, {
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
      renderPage(p);
      setHelpPage(p === Page.HELP ? helpPage : page);
    }
  }

  function selectPage(p: Page): void {
    setPage(p);
    switchPage(p);
  }

  React.useEffect(() => switchPage(page));

  function endSession(): void {
    if (context.user) {
      auth.logout(context.user);
      setContext({ target: context.target, user: null });
    }
  }

  return (
    <nav className="navbar navbar-expand navbar-dark pr-0">
      <ul className="navbar-nav" style={{width: "100%"}}>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(Page.ANNOTATE)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Annotate"
            onClick={() => selectPage(Page.ANNOTATE)}
            ><icons.AnnotateIcon/>
          </a>
        </li>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(Page.ANNOTATIONS)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Annotations"
            onClick={() => selectPage(Page.ANNOTATIONS)}
            ><icons.AnnotationsIcon/>
          </a>
        </li>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(Page.SEARCH)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Search"
            onClick={() => selectPage(Page.SEARCH)}
            ><icons.SearchIcon/>
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#"data-toggle="tooltip" 
             data-placement="bottom" title="Context Help"
            onClick={() => selectPage(Page.HELP)}
          ><icons.HelpIcon/></a>
        </li>
        <li className="nav-item ml-auto">
          <a
            className={"nav-link" + activeFlag(Page.PROFILE)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title={context.user ? "Profile" : "Login"}
            onClick={() => selectPage(Page.PROFILE)}>
            {context.user ? 
              <span><icons.UserIcon/> {shorten(context.user.name, 15)}</span>
              : <icons.LoginIcon/>
            }
          </a>
        </li>
        {context.user ? 
          <li className="nav-item">
            <a className="nav-link" style={{paddingLeft: 0}}
              href="#"data-toggle="tooltip" 
              data-placement="bottom" title="Logout"
              onClick={endSession}
            ><icons.LogoutIcon/></a>
          </li>
        : <></>
        }
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

