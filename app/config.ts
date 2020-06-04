interface ConfRec {
  widgetServerUrl?: string;
  apiServerUrl?: string;
  apiPath?: string;
  solrUrl?: string;
}

const confRec = (window as any).b2note as ConfRec|undefined;

export default {
  widgetServerUrl: confRec?.widgetServerUrl ? confRec.widgetServerUrl : "http://localhost:8080",
  apiServerUrl: confRec?.apiServerUrl ? confRec.apiServerUrl : "http://localhost:3060",
  apiPath: confRec?.apiPath ? confRec.apiPath : "/api",
  solrUrl: confRec?.solrUrl ? confRec.solrUrl : "https://b2note.eudat.eu/solr/b2note_index/select",
  imgPath: "/img/",
  pageSize: 10,
  version: "v3.1.0"
};