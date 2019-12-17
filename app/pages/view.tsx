import * as React from "react";
import { Context } from "../widget/context";
import * as anModel from "../shared/annotationsModel";
import { shorten } from "./pages";
import * as icons from "react-icons/fa";
import { DownloadIcon } from "./icons";

const LookIcon = icons.FaEye;

export interface TargetTrProps {
  context: Context;
  target: anModel.AnTarget;
}

export function TargetTr(props: TargetTrProps): React.FunctionComponentElement<TargetTrProps> { 
  const thisFile = props.target.source === props.context.target.source;
  return (
    <tr>
      <td style={{border: "none", padding: 0}}>
        <a 
          data-toggle="tooltip" data-placement="bottom" title={props.target.source + (thisFile ? " (this file)" : " (other file)")}
          href={props.target.id}>
          <span className={thisFile ? "font-weight-bold" : ""}>{shorten(props.target.source, 27)}</span>
        </a>
      </td>
      <td style={{border: "none", padding: 0}}>
        <button type="button" className="btn btn-sm btn-outline-primary list-action-button"
          data-toggle="tooltip" data-placement="bottom" title="Visit landing page"
        >
          <LookIcon/>
        </button>
        <button type="button" className="btn btn-sm btn-outline-primary list-action-button"
          data-toggle="tooltip" data-placement="bottom" title="Download file"
        >
          <DownloadIcon/>
        </button>
      </td>
    </tr>
  );
}


