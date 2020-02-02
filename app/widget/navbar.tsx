import { matchSwitch } from '@babakness/exhaustive-type-checking';
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "../components/icons";
import { UserProfile } from "../core/user";
import { getUserProfile } from "../api/profile";
import { Page } from "../pages/pages";
import { render as annotateRender } from "../pages/annotate/view";
import { render as annotationsRender } from "../pages/annotations/view";
import { render as searchRender } from "../pages/search/view";
import { render as helpRender } from "../pages/help/view";
import { render as profileRender } from "../pages/profile/view";
import { HelpSection } from "../pages/help/defs";
import { Context, isUserLogged } from "../context";
import * as auth from "../api/auth";
import { shorten } from "../components/utils";

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

export function Navbar(props: Props): React.FunctionComponentElement<Context> {
  const [page, setPage] = React.useState(Page.ANNOTATE);
  const [helpPage, setHelpPage] = React.useState(Page.ANNOTATE);
  const [context, setContext] = React.useState({ ...props.context, user: auth.retrieveUser() });
  const [userProfile, setUserProfile] = React.useState(null as UserProfile|null);

  React.useEffect(() => {
    if (context.user) {
      getUserProfile(context.user).then(p => setUserProfile(p));
    }
  }, [context]);

  const activeFlag = (p: Page): string => p === page ? " active" : "";

  function logout(): void {
    if (context.user) {
      auth.logout()
      .then(() => {
        setUserProfile(null);
        selectPage(Page.ANNOTATE);
        setContext({ ...context, user: null });
      })
      .catch(err => console.error(err));
    }
  }

  async function profileLoggedRenderPm(): Promise<RenderFn> {
    if (isUserLogged(context) && userProfile !== null) {
      return Promise.resolve(() => profileRender(userProfile, setUserProfile));
    } else {
      const user = await auth.login();
      const newContext = { ...context, user };
      setContext(newContext);
      const p = await getUserProfile(user);
      return Promise.resolve(() => profileRender(p, setUserProfile));
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

  function endSession(): void {
    if (context.user) {
      logout();
    }
  }

  React.useEffect(() => switchPage(page), []);

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
          <a className={"nav-link" + activeFlag(Page.HELP)} href="#"data-toggle="tooltip" 
             data-placement="bottom" title="Context Help"
            onClick={() => selectPage(Page.HELP)}
          ><icons.HelpIcon/></a>
        </li>
        <li className="nav-item ml-auto">
          <a
            className={"nav-link" + activeFlag(Page.PROFILE)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title={context.user ? "Profile" : "Login"}
            onClick={() => selectPage(Page.PROFILE)}>
            {userProfile ? 
              <span><icons.UserIcon/> {shorten(userProfile.name, 15)}</span>
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