import * as React from "react";
import { config } from "../../config";
import { b2noteBlue } from "app/components/defs";

export const imgHelpPath = config.widgetUrl + config.imgPath + "help/";

function renderButtonItemTr(icon: React.ReactElement, border: string, bgCol: string, text: string): React.ReactElement {
  return (
    <tr>
      <td>
        <div style={{padding: "0 4px 4px 4px", margin: "2px 0", border, backgroundColor: bgCol, display: "inline"}}>
          {icon}
        </div>
      </td>
      <td>
        {text}
      </td>
    </tr>
  );
}
export function renderMenuItemTr(icon: React.ReactElement, text: string): React.ReactElement {
  return renderButtonItemTr(icon, "none", b2noteBlue, text);
}

export function renderFilterItemTr(icon: React.ReactElement, text: string): React.ReactElement {
  return renderButtonItemTr(icon, "1px solid gray", "#ffffff", text);
}
