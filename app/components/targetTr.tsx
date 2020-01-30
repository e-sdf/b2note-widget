import * as React from "react";
import { Context } from "../context";
import * as anModel from "../core/annotationsModel";
import { shorten } from "../utils";
import * as icons from "react-icons/fa";
import { DownloadIcon } from "./icons";

const LookIcon = icons.FaEye;

interface TargetTrProps {
  context: Context;
  target: anModel.AnTarget;
}

export default function TargetTr(props: TargetTrProps): React.FunctionComponentElement<TargetTrProps> { 
  const thisFile = props.target.source === props.context.target.source;
  return (
    <tr>
      <td style={{border: "none", padding: 0}}>
        <span 
          data-toggle="tooltip" data-placement="bottom" title={props.target.source + (thisFile ? " (this file)" : " (other file)")}
        >
          <span className={thisFile ? "font-weight-bold" : ""}>{shorten(props.target.source, 27)}</span>
        </span>
      </td>
      <td style={{border: "none", padding: 0}}>
        <button type="button" className="btn btn-sm btn-outline-primary list-action-button"
          data-toggle="tooltip" data-placement="bottom" title="Visit landing page"
          onClick={() => window.open(props.target.id, "_blank")}
        >
          <LookIcon/>
        </button>
        <button type="button" className="btn btn-sm btn-outline-primary list-action-button"
          data-toggle="tooltip" data-placement="bottom" title="Download file"
          onClick={() => window.open(props.target.source, "_blank")}
        >
          <DownloadIcon/>
        </button>
      </td>
    </tr>
  );
}


