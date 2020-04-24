import { apiUrl } from "./core/server";

interface ConfRec {
  serverUrl?: string;
  solrUrl?: string;
}

const confRec = (window as any).b2note as ConfRec|undefined;
export const serverUrl = confRec?.serverUrl ? confRec.serverUrl : "http://localhost:3060";
export const solrUrl = confRec?.solrUrl ? confRec.solrUrl : "https://b2note.eudat.eu/solr/b2note_index/select";

export const endpointUrl = serverUrl + apiUrl;

export const pageSize = 10;

export const version = "v3.0";
export const subversion = "BETA8";