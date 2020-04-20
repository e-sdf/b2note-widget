import { matchSwitch } from '@babakness/exhaustive-type-checking';
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as icons from "../components/icons";
import type { User, UserProfile } from "../core/user";
import { Page } from "../pages/pages";
import { render as annotateRender } from "../pages/annotate/view";
import { render as annotationsRender } from "../pages/annotations/view";
import { render as searchRender } from "../pages/search/view";
import { render as helpRender } from "../pages/help/view";
import { render as profileRender } from "../pages/profile/view";
import { HelpSection } from "../pages/help/defs";
import type { Context } from "../context";
import * as auth from "../api/auth";
import * as profile from "../api/profile";
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
  const [page, setPage] = React.useState(props.context.mbTarget ? Page.ANNOTATE : Page.ANNOTATIONS);
  const [helpPage, setHelpPage] = React.useState(Page.ANNOTATE);
  const [context, setContext] = React.useState(props.context);

  function ensureLoginPm(): Promise<[User, UserProfile]> {
    return new Promise((resolve, reject) => {
      if (!context.mbUser) {
        auth.retrieveUserPm().then(
          ([user, userProfile]) => {
            setContext({ ...context, mbUser: user, mbUserProfile: userProfile });
            resolve([user, userProfile]);
          },
          () => {
            auth.loginPm().then(
              ([user, userProfile]) => {
                setContext({ ...context, mbUser: user, mbUserProfile: userProfile });
                resolve([user, userProfile]);
              },
              err => {
                console.error(err);
                reject();
              }
            );
          }
        );
      } else {
        if (context.mbUserProfile) {
          resolve([context.mbUser, context.mbUserProfile]);
        } else {
          reject("User profile not present for current user!");
        }
      }
    });
  }

  React.useEffect(() => { 
    if (context.mbTarget) {
      ensureLoginPm().then(([user, userProfile]) => setContext({ ...context, mbUser: user, mbUserProfile: userProfile }));
    }
  }, []);

  const activeFlag = (p: Page): string => p === page ? " active" : "";

  function logout(): void {
    if (context.mbUser) {
      auth.logoutPm().then(
        () => {
          setContext({ ...context, mbUser: null, mbUserProfile: null });
        }
      );
    }
  }

  function updateUserProfile(): void {
    if (context.mbUser) {
      profile.getUserProfilePm(context.mbUser).then(userProfile => setContext({ ...context, mbUserProfile: userProfile }));
    } else {
      throw new Error("context.mbUser is null");
    }
  }

  function profileLoggedRenderPm(): Promise<RenderFn> {
    return new Promise((resolve, reject) => {
      const u = context.mbUser;
      const p = context.mbUserProfile;
      if (u && p) {
        resolve(() => profileRender(u, p, () => { updateUserProfile(); gotoPage(Page.ANNOTATE); }));
      } else {
        ensureLoginPm().then(
          ([user, userProfile]) => {
            resolve(() => profileRender(user, userProfile, () => { updateUserProfile(); gotoPage(Page.ANNOTATE); }));
          }
        );
      }
    });
  }

  function renderPage(p: Page): void {
    return matchSwitch(p, {
      [Page.ANNOTATE]: () =>  annotateRender(context),
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
      setHelpPage(p === Page.HELP ? helpPage : p);
    }
  }

  function gotoPage(p: Page): void {
    setPage(p);
    switchPage(p);
  }

  function endSession(): void {
    if (context.mbUser) {
      logout();
    }
  }

  React.useEffect(() => switchPage(page), []);

  React.useEffect(() => {
    if (context.mbUser === null && page === Page.PROFILE) { 
      gotoPage(Page.ANNOTATE);
    } else {
      gotoPage(page);
    }
  }, [context]);

  return (
    <nav className="navbar navbar-expand navbar-dark pr-0">
      <ul className="navbar-nav" style={{width: "100%"}}>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(Page.ANNOTATE)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Annotate"
            onClick={() => gotoPage(Page.ANNOTATE)}
            ><icons.AnnotateIcon/>
          </a>
        </li>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(Page.ANNOTATIONS)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Annotations"
            onClick={() => gotoPage(Page.ANNOTATIONS)}
            ><icons.AnnotationsIcon/>
          </a>
        </li>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(Page.SEARCH)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title="Search"
            onClick={() => gotoPage(Page.SEARCH)}
            ><icons.SearchIcon/>
          </a>
        </li>
        <li className="nav-item">
          <a className={"nav-link" + activeFlag(Page.HELP)} href="#"data-toggle="tooltip" 
             data-placement="bottom" title="Context Help"
            onClick={() => gotoPage(Page.HELP)}
          ><icons.HelpIcon/></a>
        </li>
        <li className="nav-item ml-auto">
          <a
            className={"nav-link" + activeFlag(Page.PROFILE)} href="#" 
            data-toggle="tooltip" data-placement="bottom" title={context.mbUser ? "Profile" : "Login"}
            onClick={() => gotoPage(Page.PROFILE)}>
            {context.mbUserProfile ? 
              <span><icons.UserIcon/> {shorten(context.mbUserProfile.name, 15)}</span>
              : <icons.LoginIcon/>
            }
          </a>
        </li>
        {context.mbUser ? 
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