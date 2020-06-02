import * as anModel from "../core/annotationsModel";
import fileDownload from "js-file-download"; 
import config from "../config";
import { mkRDF } from "../core/export/rdf";
import { anRecords2ttl } from "../core/export/turtle";

function mkFilename(format: anModel.Format): string {
  return "annotations_" + anModel.mkTimestamp() + "." + anModel.mkFileExt(format);
}

export function downloadJSON(anRecords: anModel.AnRecord[]): void {
  fileDownload(JSON.stringify(anRecords, null, 2), mkFilename(anModel.Format.JSONLD));
}

export function downloadRDF(anRecords: anModel.AnRecord[]): void {
  const rdf = mkRDF(anRecords, config.apiServerUrl + config.apiPath);
  fileDownload(rdf, mkFilename(anModel.Format.RDF));
}

export function downloadTurtle(anRecords: anModel.AnRecord[]): void {
  const ttl = anRecords2ttl(anRecords, config.apiServerUrl + config.apiPath);
  fileDownload(ttl, mkFilename(anModel.Format.TTL));
}
