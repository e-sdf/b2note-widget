import * as React from "react";
import type { Context } from "../context";
import { shorten } from "../components/utils";
import * as icons from "react-icons/fa";
import { DownloadIcon } from "./icons";
import type { Target, AnTarget } from "../core/annotationsModel";
// import { ResolvedTarget } from "../pages/annotations/loader";

const LookIcon = icons.FaEye;

interface TargetTrProps {
  mbContextTarget: Target|null;
  // resTarget: ResolvedTarget;
  target: AnTarget;
}

export default function TargetTr(props: TargetTrProps): React.FunctionComponentElement<TargetTrProps> { 
  const thisFile = props.target.source === props.mbContextTarget?.source;
  return (
    <tr>
      <td style={{border: "none", padding: 0}}>
        <span 
          data-toggle="tooltip" data-placement="bottom" title={props.target.source + (thisFile ? " (this file)" : " (other file)")}
        >
          <span className={thisFile ? "font-weight-bold" : ""}>{shorten(props.target.source, 23)}</span>
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


