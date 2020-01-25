import * as React from "react";
import { SectionProps } from "./defs";
import * as icons from "../../components/icons";
import { b2noteBlue } from "../../components/defs";

export function MenuSection(props: SectionProps): React.FunctionComponentElement<SectionProps> {

  function renderMenuItem(icon: React.ReactElement, text: string): React.ReactElement {
    return (
      <tr>
        <td>
          <div style={{padding: "0 4px 4px 4px", margin: "2px 0", backgroundColor: b2noteBlue, display: "inline"}}>
            {icon}
          </div>
        </td>
        <td>
          {text}
        </td>
      </tr>
    );
  }

  return (
    <>
      <h2>{props.header}</h2>
      <p>
        The main menu toolbar provides access to main B2NOTE functions:
      </p>
      <table className="table">
        <tbody>
          {renderMenuItem(<icons.AnnotateIcon style={{color: "white"}}/>, "create annotations")}
          {renderMenuItem(<icons.AnnotationsIcon style={{color: "white"}}/>, "browse, filter, manage and export annotations")}
          {renderMenuItem(<icons.SearchIcon style={{color: "white"}}/>, "search annotations")}
          {renderMenuItem(<icons.HelpIcon style={{color: "white"}}/>, "access help section for the page you are visiting")}
          {renderMenuItem(<icons.LoginIcon style={{color: "white"}}/>, "login using B2ACCESS")}
          {renderMenuItem(<icons.UserIcon style={{color: "white"}}/>, "edit your profile")}
          {renderMenuItem(<icons.LogoutIcon style={{color: "white"}}/>, "logout from your session")}
        </tbody>
      </table>
    </>
  );
}


