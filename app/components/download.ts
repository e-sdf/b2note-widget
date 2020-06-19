import * as anModel from "../core/annotationsModel";
import fileDownload from "js-file-download"; 
import config from "../config";
import { mkRDF } from "../core/export/rdf";
import { annotations2ttl } from "../core/export/turtle";

function mkFilename(format: anModel.Format): string {
  return "annotations_" + anModel.mkTimestamp() + "." + anModel.mkFileExt(format);
}

export function downloadJSON(annotations: anModel.Annotation[]): void {
  fileDownload(JSON.stringify(annotations, null, 2), mkFilename(anModel.Format.JSONLD));
}

export function downloadRDF(annotations: anModel.Annotation[]): void {
  const rdf = mkRDF(annotations, config.apiServerUrl + config.apiPath);
  fileDownload(rdf, mkFilename(anModel.Format.RDF));
}

export function downloadTurtle(annotations: anModel.Annotation[]): void {
  const ttl = annotations2ttl(annotations, config.apiServerUrl + config.apiPath);
  fileDownload(ttl, mkFilename(anModel.Format.TTL));
}
