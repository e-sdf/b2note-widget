import { matchSwitch } from '@babakness/exhaustive-type-checking';
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as config from "../config";
import * as auth from "../api/auth";
import * as profileApi from "../api/profile";
import { Context } from "../context";
import * as icons from "../components/icons";
import { PagesEnum } from "../pages/pages";
import { AnnotatePage } from "../pages/annotate/view";
import { AnnotationsPage } from "../pages/annotations/view";
import { SearchPage } from "../pages/search/view";
import { HelpPage } from "../pages/help/view";
import { ProfilePage } from "../pages/profile/view";
import { HelpSection } from "../pages/help/defs";
import { shorten } from "../components/utils";

function WidgetInfo(): React.ReactElement {
  return (
    <div>
      <img src="img/logo.png" width="100%"/>
      <p style={{fontStyle: "italic"}}>
        Use POST request to load the annotation target.
      </p>
    </div>
  );
}

enum LoginState { NOT_LOGGED, LOGGING, LOGGED, ERROR };

function pageToHelp(page: PagesEnum): HelpSection {
  return matchSwitch(page, {
    [PagesEnum.ANNOTATE]: () => HelpSection.ANNOTATE,
    [PagesEnum.ANNOTATIONS]: () => HelpSection.ANNOTATIONS,
    [PagesEnum.SEARCH]: () => HelpSection.SEARCH,
    [PagesEnum.PROFILE]: () => HelpSection.PROFILE,
    [PagesEnum.HELP]: () => HelpSection.TOC // just for type exahaustivness, not used actually
  });  
}

interface Props {
  context: Context;
}

function Widget(props: Props): React.FunctionComponentElement<Context> {
  const [page, setPage] = React.useState(props.context.mbTarget ? PagesEnum.ANNOTATE : PagesEnum.ANNOTATIONS);
  const [helpPage, setHelpPage] = React.useState(PagesEnum.ANNOTATE);
  const [context, setContext] = React.useState(props.context);
  const [loginState, setLoginState] = React.useState(LoginState.NOT_LOGGED);

  //React.useEffect(() => { 
    //if (context.mbTarget) {
      //ensureLoginPm().then();
    //}
  //}, []);

  //function ensureLoginPm(): Promise<AuthUser> {
    //return new Promise((resolve, reject) => {
      //setLoginState(LoginState.LOGGING);
      //if (!context.mbUser) {
        //auth.loginPm().then(
          //user => {
            //setLoginState(LoginState.LOGGED);
            //setContext({ ...context, mbUser: user });
            //resolve(user);
          //},
          //err => {
            //setLoginState(LoginState.ERROR);
            //console.error(err);
            //reject();
          //}
        //);
      //} else {
        //resolve(context.mbUser);
      //}
    //});
  //}


  React.useEffect(() => setHelpPage(page === PagesEnum.HELP ? helpPage : page), [page]);

  function updateUserProfile(): void {
    const u = context.mbUser;
    if (u) {
      profileApi.getUserProfilePm(u.token).then(
        profile => setContext({
          ...context,
          mbUser: { token: u.token, profile }
        })
      );
    } else {
      throw new Error("context.mbUser is null");
    }
  }

  function login(): void {
    setLoginState(LoginState.LOGGING);
    auth.loginPm().then(
      user => {
        setLoginState(LoginState.LOGGED);
        setContext({ ...context, mbUser: user });
      },
      err => {
        setLoginState(LoginState.ERROR);
        console.error(err);
      }
    );
  }

  function logout(): void {
    if (context.mbUser) {
      auth.logoutPm().then(
        () => {
          setContext({ ...context, mbUser: null });
          setLoginState(LoginState.NOT_LOGGED);
        }
      );
    }
  }

  function pageComp(): React.ReactElement {
    return matchSwitch(page, {
      [PagesEnum.ANNOTATE]: () => <AnnotatePage context={context}/>,
      [PagesEnum.ANNOTATIONS]: () => <AnnotationsPage context={context}/>,
      [PagesEnum.SEARCH]: () => <SearchPage context={context}/>,
      [PagesEnum.PROFILE]: () => context.mbUser ? 
        <ProfilePage user={context.mbUser} updateProfileFn={updateUserProfile}/>
          : <></>,
      [PagesEnum.HELP]: () => <HelpPage section={pageToHelp(helpPage)}/>
    });  
  }

  function renderNavbar(): React.ReactElement {
    const activeFlag = (p: PagesEnum): string => p === page ? " active" : "";

    return (
      <nav className="navbar navbar-expand navbar-dark pr-0">
        <ul className="navbar-nav" style={{width: "100%"}}>
          <li className="nav-item">
            <a
              className={"nav-link" + activeFlag(PagesEnum.ANNOTATE)} href="#" 
              data-toggle="tooltip" data-placement="bottom" title="Annotate"
              onClick={() => setPage(PagesEnum.ANNOTATE)}
              ><icons.AnnotateIcon/>
            </a>
          </li>
          <li className="nav-item">
            <a
              className={"nav-link" + activeFlag(PagesEnum.ANNOTATIONS)} href="#" 
              data-toggle="tooltip" data-placement="bottom" title="Annotations"
              onClick={() => setPage(PagesEnum.ANNOTATIONS)}
              ><icons.AnnotationsIcon/>
            </a>
          </li>
          <li className="nav-item">
            <a
              className={"nav-link" + activeFlag(PagesEnum.SEARCH)} href="#" 
              data-toggle="tooltip" data-placement="bottom" title="Search"
              onClick={() => setPage(PagesEnum.SEARCH)}
              ><icons.SearchIcon/>
            </a>
          </li>
          <li className="nav-item">
            <a className={"nav-link" + activeFlag(PagesEnum.HELP)} href="#"data-toggle="tooltip" 
               data-placement="bottom" title="Context Help"
              onClick={() => setPage(PagesEnum.HELP)}
            ><icons.HelpIcon/></a>
          </li>
          <li className="nav-item ml-auto">
            <a
              className={"nav-link" + activeFlag(PagesEnum.PROFILE)} href="#" 
              data-toggle="tooltip" data-placement="bottom" title={context.mbUser ? "Profile" : "Login"}
              onClick={() =>
                matchSwitch(loginState, {
                  [LoginState.NOT_LOGGED]: () => login(),
                  [LoginState.LOGGING]: () => void(null),
                  [LoginState.LOGGED]: () => setPage(PagesEnum.PROFILE),
                  [LoginState.ERROR]: () => login()
                })}>
              {matchSwitch(loginState, {
                [LoginState.NOT_LOGGED]: () => <icons.LoginIcon/>,
                [LoginState.LOGGING]: () => <span>Logging in...</span>,
                [LoginState.LOGGED]: () => <span><icons.UserIcon/> {shorten(context.mbUser?.profile.name || "", 15)}</span>,
                [LoginState.ERROR]: () => <span>Login error <icons.LoginIcon/></span>
              })}
            </a>
          </li>
          {loginState === LoginState.LOGGED ? 
            <li className="nav-item">
              <a className="nav-link" style={{paddingLeft: 0}}
                href="#"data-toggle="tooltip" 
                data-placement="bottom" title="Logout"
                onClick={logout}
              ><icons.LogoutIcon/></a>
            </li>
          : <></>
          }
        </ul>
      </nav>
    );
  }

  return (
    <div>
      <img src="img/logo.png" width="100%"/>
      <div id="widget-version">
        <a href="https://github.com/e-sdf/b2note-reactjs/releases" target="_blank" rel="noopener noreferrer">
          {config.version}<br/>
          {config.subversion}
        </a>
      </div>
      {renderNavbar()}
      {pageComp()} 
    </div>
  );
}

export function canRenderWidgetInfo(): boolean {
 return document.getElementById("b2note-widget-info") ? true : false;
}

export function canRenderWidget(): boolean {
 return document.getElementById("b2note-widget") ? true : false;
}

export function renderWidgetInfo(): void {
  const container = document.getElementById("b2note-widget-info");
  if (container) {
    ReactDOM.render(<WidgetInfo/>, container);
  } else {
    console.error("widget DOM element missing");
  }
}

export function renderWidget(context: Context): void {
  const container = document.getElementById("b2note-widget");
  if (container) {
    ReactDOM.render(<Widget context={context}/>, container);
    if (context.mbTarget) {
      console.log(`Annotating pid="${context.mbTarget.pid}" source="${context.mbTarget.source}"`);
    } else {
      console.log("No target, will be in the view more");
    }
  } else {
    console.error("widget DOM element missing");
  }
}
