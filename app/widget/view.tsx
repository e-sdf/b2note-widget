import { matchSwitch } from '@babakness/exhaustive-type-checking';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { config } from "../config";
import type { Token } from "client/api/http";
import { AuthProvidersEnum } from "client/api/auth/defs";
import * as auth from "client/api/auth/auth";
import * as profileApi from "client/api/profile";
import { Context } from "client/context";
import * as icons from "client/components/icons";
import { PagesEnum } from "../pages/pages";
import AnnotatePage from "../pages/annotate/view";
import AnnotationsPage from "../pages/annotations/view";
import SearchPage from "../pages/search/view";
import AuthProviderSelectionPage from "../pages/login";
import ProfilePage from "../pages/profile/view";
import HelpPage from "../pages/help/view";
import { HelpSection } from "../pages/help/defs";
import { shorten } from "client/components/utils";
import { notifyLoaded } from "client/components/notify";

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

function pageToHelp(page: PagesEnum): HelpSection {
  return matchSwitch(page, {
    [PagesEnum.ANNOTATE]: () => HelpSection.ANNOTATE,
    [PagesEnum.ANNOTATIONS]: () => HelpSection.ANNOTATIONS,
    [PagesEnum.SEARCH]: () => HelpSection.SEARCH,
    [PagesEnum.LOGIN]: () => HelpSection.LOGIN,
    [PagesEnum.PROFILE]: () => HelpSection.PROFILE,
    [PagesEnum.HELP]: () => HelpSection.TOC // just for type exahaustivness, not used actually
  });
}

enum LoginStateEnum { NOT_LOGGED, LOGGING, LOGGED, ERROR }

interface Props {
  context: Context;
}

function Widget(props: Props): React.FunctionComponentElement<Props> {
  const [page, setPage] = React.useState(props.context.mbTarget ? PagesEnum.ANNOTATE : PagesEnum.ANNOTATIONS);
  const [helpPage, setHelpPage] = React.useState(PagesEnum.ANNOTATE);
  const [context, setContext] = React.useState(props.context);
  const [authProvider, setAuthProvider] = React.useState(null as null|AuthProvidersEnum);
  const [chosenAuthProvider, setChosenAuthProvider] = React.useState(null as null | AuthProvidersEnum);
  const [loginState, setLoginState] = React.useState(LoginStateEnum.NOT_LOGGED);

  function retrieveProfile(provider: AuthProvidersEnum|null, token: Token|null): void {
    if (provider && token) {
      profileApi.getUserProfilePm(config, token, () => auth.loginPm(context, provider)).then(
        profile => {
          setLoginState(LoginStateEnum.LOGGED);
          setContext({ ...context, mbUser: { token, profile }});
        },
        err => {
          setLoginState(LoginStateEnum.ERROR);
          console.error(err);
        }
      );
    }
  }

  function handleExternalLogin(msg: MessageEvent): void {
    if (msg.origin === "http://mpagasas.di.uoa.gr:4200") {
      console.log("Received message from the hosting service: ");
      console.log(msg.data);
      const servicesToken = msg.data.token;
      if (servicesToken && loginState !== LoginStateEnum.LOGGING) {
        setLoginState(LoginStateEnum.LOGGING);
        auth.takeLoginPm(context, AuthProvidersEnum.OPEN_AIRE, servicesToken).then(
          token => retrieveProfile(chosenAuthProvider, token),
          err => setLoginState(LoginStateEnum.NOT_LOGGED)
        );
      }
    }
  }

  function loginPm(): Promise<Token|null> {
    return new Promise((resolve, reject) => {

      function cancel() {
        setLoginState(LoginStateEnum.NOT_LOGGED);
        resolve(null);
      }

      setLoginState(LoginStateEnum.LOGGING);
      if (chosenAuthProvider) {
        auth.loginPm(props.context, chosenAuthProvider, cancel).then(
          token => {
            retrieveProfile(chosenAuthProvider, token);
            resolve(token);
          },
          err => {
            setLoginState(LoginStateEnum.ERROR);
            console.error(err);
            reject();
          }
        );
      } else {
        setPage(PagesEnum.LOGIN);
        reject();
      }
    });
  }

  function firstLogin(): void {
    context.authStorage.retrieve().then(
      sAuth => {
        setLoginState(LoginStateEnum.LOGGING);
        setAuthProvider(sAuth.provider);
        retrieveProfile(sAuth.provider, sAuth.token);
      },
      () => setPage(PagesEnum.LOGIN)
    );
  }

  function logout(): void {
    context.authStorage.delete().then(
      () => {
      setContext({ ...context, mbUser: null });
      setLoginState(LoginStateEnum.NOT_LOGGED);
      setAuthProvider(null);
      setChosenAuthProvider(null);
      }
    );
  }

  React.useEffect(() => {
    window.addEventListener("message", (msg) => handleExternalLogin(msg), false);
    notifyLoaded(); // Notify the hosting service that the widget has been loaded and is ready to possibly receive a login token
    setTimeout(
      () => { // Wait 500ms and then check if we should not login ourselves.
        if (context.mbTarget && loginState === LoginStateEnum.NOT_LOGGED) {
          firstLogin();
        }
      },
      500
    );
  }, []);

  React.useEffect(
    () => {
      if (chosenAuthProvider !== null) {
        setAuthProvider(chosenAuthProvider);
        loginPm().then(() => setPage(PagesEnum.ANNOTATE));
      }
    },
    [chosenAuthProvider]
  );

  React.useEffect(() => setHelpPage(page === PagesEnum.HELP ? helpPage : page), [page]);

  function pageComp(): React.ReactElement {
    return matchSwitch(page, {
      [PagesEnum.ANNOTATE]: () => <AnnotatePage context={context} authErrAction={() => loginPm()}/>,
      [PagesEnum.ANNOTATIONS]: () => <AnnotationsPage context={context} authErrAction={() => loginPm()}/>,
      [PagesEnum.SEARCH]: () => <SearchPage context={context} authErrAction={() => loginPm()}/>,
      [PagesEnum.LOGIN]: () => <AuthProviderSelectionPage config={config} selectedHandler={(p) => setChosenAuthProvider(p)}/>,
      [PagesEnum.PROFILE]: () => context.mbUser ?
        <ProfilePage
          config={props.context.config}
          user={context.mbUser}
          updateProfileFn={() => retrieveProfile(authProvider, context.mbUser?.token ? context.mbUser.token : null)} authErrAction={() => loginPm()}/>
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
              data-toggle="tooltip" data-placement="bottom" title={context.mbUser ? context.mbUser.profile.email : "Login"}
              onClick={() =>
                matchSwitch(loginState, {
                  [LoginStateEnum.NOT_LOGGED]: () => firstLogin(),
                  [LoginStateEnum.LOGGING]: () => void(null),
                  [LoginStateEnum.LOGGED]: () => setPage(PagesEnum.PROFILE),
                  [LoginStateEnum.ERROR]: () => firstLogin()
                })}>
              {matchSwitch(loginState, {
                [LoginStateEnum.NOT_LOGGED]: () => <icons.LoginIcon/>,
                [LoginStateEnum.LOGGING]: () => <span>Logging in...</span>,
                [LoginStateEnum.LOGGED]:
                  () => <span><icons.UserIcon/> {shorten(context.mbUser?.profile.personName || "", 13)}</span>,
                [LoginStateEnum.ERROR]:
                  () => <span style={{fontSize: "90%"}}>Login error, try again</span>
              })}
            </a>
          </li>
          {loginState === LoginStateEnum.LOGGED ?
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
          {config.version}
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
      console.log(`[B2NOTE] Annotating pid="${context.mbTarget.pid}" source="${context.mbTarget.source}"`);
    } else {
      console.log("[B2NOTE] No target, will be in the view more");
    }
  } else {
    console.error("[B2NOTE]widget DOM element missing");
  }
}
