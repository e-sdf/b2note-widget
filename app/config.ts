interface ConfRec {
  apiServerUrl?: string;
  apiPath?: string;
  solrUrl?: string;
}

const confRec = (window as any).b2note as ConfRec|undefined;

export default {
  apiServerUrl: confRec?.apiServerUrl ? confRec.apiServerUrl : "http://localhost:3060",
  apiPath: confRec?.apiPath ? confRec.apiPath : "/api",
  solrUrl: confRec?.solrUrl ? confRec.solrUrl : "https://b2note.eudat.eu/solr/b2note_index/select",
  imgPath: "/img/",
  pageSize: 10,
  version: "v3.0",
  subversion: "BETA10"
};