import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { config } from "app/config";
import type { SysContext, AppContext } from "app/context";
import type { Token } from "core/http";
import { AuthProvidersEnum } from "app/api/auth/defs";
import * as auth from "app/api/auth/auth";
import * as profileApi from "app/api/profile";
import * as icons from "app/components/icons";
import { PagesEnum } from "app/pages/pages";
import AnnotatePage from "app/pages/annotate/view";
import AnnotationsPage from "app/pages/annotations/view";
import SearchPage from "app/pages/search/view";
import AuthProviderSelectionPage from "app/pages/login";
import ProfilePage from "app/pages/profile/view";
import HelpPage from "app/pages/help/view";
import ReportBugPage from "app/pages/reportBug";
import { HelpSection } from "app/pages/help/defs";
import { notifyLoaded, notifyToken } from "app/notify";
import { shorten } from "app/components/utils";

function WidgetInfo(): React.ReactElement {
  return (
    <div>
      <img src="img/logo.png" style={{width: "100%"}}/>
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
    [PagesEnum.HELP]: () => HelpSection.TOC, // just for type exahaustivness, not used actually
    [PagesEnum.REPORT_BUG]: () => HelpSection.TOC // just for type exahaustivness, not used actually
  });
}

enum LoginStateEnum { NOT_LOGGED, LOGGING, LOGGED, ERROR }

interface Props {
  sysContext: SysContext;
}

function Widget(props: Props): React.FunctionComponentElement<Props> {
  const mbTarget = props.sysContext.mbTarget;
  const [page, setPage] = React.useState(mbTarget ? PagesEnum.ANNOTATE : PagesEnum.ANNOTATIONS);
  const [helpPage, setHelpPage] = React.useState(PagesEnum.ANNOTATE);
  const [appContext, setAppContext] = React.useState({ mbUser: null, authErrAction: loginPm } as AppContext);
  const [authProvider, setAuthProvider] = React.useState(null as null|AuthProvidersEnum);
  const [chosenAuthProvider, setChosenAuthProvider] = React.useState(null as null | AuthProvidersEnum);
  const [loginState, setLoginState] = React.useState(LoginStateEnum.NOT_LOGGED);

  function retrieveProfile(provider: AuthProvidersEnum|null, token: Token|null): void {
    if (provider && token) {
      profileApi.getUserProfilePm(config, token, () => auth.loginPm(props.sysContext, provider)).then(
        profile => {
          setLoginState(LoginStateEnum.LOGGED);
          setAppContext({ ...appContext, mbUser: { token, profile }});
        },
        err => {
          setLoginState(LoginStateEnum.ERROR);
          console.error(err);
        }
      );
    }
  }

  // Currently hardcoded for OpenAIRE
  function handleExternalLogin(msg: MessageEvent): void {
    if (msg.origin === "http://mpagasas.di.uoa.gr:4200") {
      const servicesToken = msg.data.token;
      if (servicesToken && loginState !== LoginStateEnum.LOGGING) {
        const provider = AuthProvidersEnum.OPEN_AIRE;
        setLoginState(LoginStateEnum.LOGGING);
        auth.takeLoginPm(props.sysContext, provider, servicesToken).then(
          token => {
            setAuthProvider(provider);
            retrieveProfile(provider, token);
            notifyToken(token);
          },
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
        auth.loginPm(props.sysContext, chosenAuthProvider, cancel).then(
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
    props.sysContext.authStorage.retrieve().then(
      sAuth => {
        setLoginState(LoginStateEnum.LOGGING);
        setAuthProvider(sAuth.provider);
        retrieveProfile(sAuth.provider, sAuth.token);
      },
      () => setPage(PagesEnum.LOGIN)
    );
  }

  function logout(): void {
    props.sysContext.authStorage.delete().then(
      () => {
      setAppContext({ ...appContext, mbUser: null });
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
        if (props.sysContext.mbTarget && loginState === LoginStateEnum.NOT_LOGGED) {
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
      [PagesEnum.ANNOTATE]: () => <AnnotatePage sysContext={props.sysContext} appContext={appContext}/>,
      [PagesEnum.ANNOTATIONS]: () => <AnnotationsPage sysContext={props.sysContext} appContext={appContext}/>,
      [PagesEnum.SEARCH]: () => <SearchPage sysContext={props.sysContext} appContext={appContext}/>,
      [PagesEnum.LOGIN]: () => <AuthProviderSelectionPage config={config} selectedHandler={(p) => setChosenAuthProvider(p)}/>,
      [PagesEnum.PROFILE]: () => appContext.mbUser ?
        <ProfilePage
          config={props.sysContext.config}
          user={appContext.mbUser}
          updateProfileFn={() => retrieveProfile(authProvider, appContext.mbUser?.token ? appContext.mbUser.token : null)} authErrAction={() => loginPm()}/>
      : <></>,
      [PagesEnum.HELP]: () => <HelpPage section={pageToHelp(helpPage)}/>,
      [PagesEnum.REPORT_BUG]: () => <ReportBugPage/>
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
            <a className={"nav-link" + activeFlag(PagesEnum.HELP)} href="#"
              data-toggle="tooltip" data-placement="bottom" title="Context Help"
              onClick={() => setPage(PagesEnum.HELP)}
            ><icons.HelpIcon/></a>
          </li>
          <li className="nav-item">
            <a className={"nav-link" + activeFlag(PagesEnum.REPORT_BUG)} href="#"
              data-toggle="tooltip" data-placement="bottom" title="Report Bug"
              onClick={() => setPage(PagesEnum.REPORT_BUG)}
            ><icons.BugIcon/></a>
          </li>
          <li className="nav-item ml-auto">
            <a
              className={"nav-link" + activeFlag(PagesEnum.PROFILE)} href="#"
              data-toggle="tooltip" data-placement="bottom" title={appContext.mbUser ? appContext.mbUser.profile.email : "Login"}
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
                  () => <span><icons.UserIcon/> {shorten(appContext.mbUser?.profile.personName || "", 11)}</span>,
                [LoginStateEnum.ERROR]:
                  () => <span style={{fontSize: "90%"}}>Login error, try again</span>
              })}
            </a>
          </li>
          {loginState === LoginStateEnum.LOGGED ?
            <li className="nav-item">
              <a className="nav-link" style={{paddingLeft: 0}} href="#"
                data-toggle="tooltip" data-placement="bottom" title="Logout"
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
      <img src={config.widgetServerUrl + config.imgPath + "logo.png"} style={{width: "100%"}}/>
      <div id="widget-version" className="text-white">
        {config.version}
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

export function renderWidget(sysContext: SysContext): void {
  const container = document.getElementById("b2note-widget");
  if (container) {
    ReactDOM.render(<Widget sysContext={sysContext}/>, container);
    if (sysContext.mbTarget) {
      console.log("[B2NOTE] Annotating:");
      console.log(sysContext.mbTarget);
    } else {
      console.log("[B2NOTE] No target, will be in the view mode");
    }
  } else {
    console.error("[B2NOTE] Widget DOM element missing");
  }
}
