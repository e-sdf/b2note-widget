import axios from "axios";
import { solrUrl } from "../../api/solr";

export interface OntologyInfo {
  label: string;
  shortForm: string;
  ontologyName: string;
  ontologyAcronym: string;
}

export function getInfo(uri: string): Promise<OntologyInfo> {
  const queryUrl = solrUrl + '?q=uris:("' + uri + '")&rows=100&wt=json';
  return axios.get(queryUrl);
}
