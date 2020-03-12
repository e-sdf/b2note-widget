import { apiUrl } from "./core/server";

export const serverPort = 3060;
export const serverUrl = "http://b2note-dev.bsc.es";
// export const serverUrl = "http://localhost:" + serverPort;
export const endpointUrl = serverUrl + apiUrl;
export const solrUrl = "https://b2note-dev.bsc.es/solr/b2note_index/select";

export const version = "v3.0 ALPHA2";