import * as React from "react";
import * as anModel from "../core/annotationsModel";
import fileDownload from "js-file-download";
import config from "../config";
import { mkRDF } from "../core/export/rdf";
import { annotations2ttl } from "../core/export/turtle";
import * as icons from "./icons";

function mkFilename(format: anModel.Format): string {
  return "annotations_" + anModel.mkTimestamp() + "." + anModel.mkFileExt(format);
}

export function downloadJSON(annotations: anModel.Annotation[]): void {
  fileDownload(JSON.stringify(annotations, null, 2), mkFilename(anModel.Format.JSONLD));
}

function downloadRDF(annotations: anModel.Annotation[]): void {
  const rdf = mkRDF(annotations, config.apiServerUrl + config.apiPath);
  fileDownload(rdf, mkFilename(anModel.Format.RDF));
}

function downloadTurtle(annotations: anModel.Annotation[]): void {
  const ttl = annotations2ttl(annotations, config.apiServerUrl + config.apiPath);
  fileDownload(ttl, mkFilename(anModel.Format.TTL));
}

interface Props {
  annotations: Array<anModel.Annotation>;
}

export default function AnDownloadButton(props: Props): React.FunctionComponentElement<Props> {
  return (
    <div className="dropleft">
      <button className="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id="anl-ddd" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <icons.DownloadIcon/>
      </button>
      <div className="dropdown-menu drop-down-menu-left" aria-labelledby="anl-ddd">
        <button type="button"
          className="dropdown-item"
          onClick={() => downloadJSON(props.annotations)}
        >Download JSON-LD</button>
        <button type="button"
          className="dropdown-item"
          onClick={() => downloadTurtle(props.annotations)}
        >Download RDF/Turtle</button>
        <button type="button"
          className="dropdown-item"
          onClick={() => downloadRDF(props.annotations)}
        >Download RDF/XML</button>
      </div>
    </div>
  );
}
