import { apiUrl } from "./core/server";

interface ConfRec {
  serverUrl?: string;
}

const confRec = (window as any).b2note as ConfRec|undefined;
export const serverUrl = confRec?.serverUrl ? confRec.serverUrl : "http://localhost:3060";

export const endpointUrl = serverUrl + apiUrl;
export const solrUrl = "https://b2note.eudat.eu/solr/b2note_index/select";

export const version = "v3.0";
export const subversion = "ALPHA3";