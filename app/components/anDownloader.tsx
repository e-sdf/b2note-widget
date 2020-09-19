import * as React from "react";
import * as anModel from "core/annotationsModel";
import * as formats from "core/formats";
import fileDownload from "js-file-download";
import type { ConfRec } from "../config";
import { mkRDF } from "core/export/rdf";
import { annotations2ttl } from "core/export/turtle";
import * as utils from "core/utils";
import * as icons from "./icons";

function mkFilename(format: formats.FormatType): string {
  return "annotations_" + utils.mkTimestamp() + "." + formats.mkFileExt(format);
}

function mkUrl(config: ConfRec): string {
  return config.apiServerUrl + config.apiPath;
}

export function downloadJSON(annotations: anModel.Annotation[]): void {
  fileDownload(JSON.stringify(annotations, null, 2), mkFilename(formats.FormatType.JSONLD));
}

function downloadRDF(config: ConfRec, annotations: anModel.Annotation[]): void {
  const rdf = mkRDF(annotations, mkUrl(config));
  fileDownload(rdf, mkFilename(formats.FormatType.RDF));
}

function downloadTurtle(config: ConfRec, annotations: anModel.Annotation[]): void {
  const ttl = annotations2ttl(annotations, mkUrl(config));
  fileDownload(ttl, mkFilename(formats.FormatType.TTL));
}

interface Props {
  config: ConfRec;
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
          onClick={() => downloadTurtle(props.config, props.annotations)}
        >Download RDF/Turtle</button>
        <button type="button"
          className="dropdown-item"
          onClick={() => downloadRDF(props.config, props.annotations)}
        >Download RDF/XML</button>
      </div>
    </div>
  );
}
