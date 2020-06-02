import * as React from "react";
import type { SectionProps } from "./defs";
import * as icons from "../../components/icons";
import { renderMenuItemTr } from "./utils";

export default function MenuSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {
  return (
    <>
      <h2>{props.header}</h2>
      <p>
        The main menu toolbar provides access to main B2NOTE functions:
      </p>
      <table className="table">
        <tbody>
          {renderMenuItemTr(<icons.AnnotateIcon style={{color: "white"}}/>, "create annotations")}
          {renderMenuItemTr(<icons.AnnotationsIcon style={{color: "white"}}/>, "browse, filter, manage and export annotations")}
          {renderMenuItemTr(<icons.SearchIcon style={{color: "white"}}/>, "search annotations")}
          {renderMenuItemTr(<icons.HelpIcon style={{color: "white"}}/>, "access help section for the page you are visiting")}
          {renderMenuItemTr(<icons.LoginIcon style={{color: "white"}}/>, "login using B2ACCESS")}
          {renderMenuItemTr(<icons.UserIcon style={{color: "white"}}/>, "edit your profile")}
          {renderMenuItemTr(<icons.LogoutIcon style={{color: "white"}}/>, "logout from your session")}
        </tbody>
      </table>
    </>
  );
}


