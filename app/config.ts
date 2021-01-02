export interface ConfRec {
  widgetServerUrl: string;
  apiServerUrl: string;
  apiPath: string;
  imgPath: string;
  name: string;
  version: string;
  homepage: string;
  customOntologies: boolean;
}

const confRec = (window as any).b2note as ConfRec|undefined;

export const config: ConfRec = {
  widgetServerUrl: confRec?.widgetServerUrl ? confRec.widgetServerUrl : "http://localhost:8080",
  apiServerUrl: confRec?.apiServerUrl ? confRec.apiServerUrl : "http://localhost:3060",
  apiPath: confRec?.apiPath ? confRec.apiPath : "/api",
  imgPath: "/img/",
  name: "B2NOTE",
  version: "v3.9.17",
  homepage: "https://b2note.eudat.eu",
  customOntologies: confRec?.customOntologies ? confRec.customOntologies : false
};

console.log("[B2NOTE] Config:");
console.log(config);

export const endpointUrl = config.apiServerUrl + config.apiPath;
