import _ from "lodash";
import allSettled from "promise.allsettled";
import type { AppContext } from "app/context";
import { get } from "core/http";
import type { OntologyTerm, OTermsDict } from "core/ontologyRegister";
import { endpointUrl } from "app/config";
import type { OntologyQuery } from "core/apiModels/ontologyQueryModel";
import { defaultOntologySources } from "core/apiModels/ontologyQueryModel";
import * as oreg from "core/ontologyRegister";

const ontologiesUrl = endpointUrl + oreg.ontologiesUrl; 

export function findOTerms(appContext: AppContext, query: string, sources = defaultOntologySources): Promise<OTermsDict> {
  return new Promise((resolve, reject) => {
    const queryParams: OntologyQuery = {
      value: query + "*",
       "sources-ids": [ ...sources.solr ? ["solr"] : [], ...sources.custom.map(o => o.id) ]
     };
    const userParams = appContext.mbUser ? { token: appContext.mbUser.token, authErrAction: appContext.authErrAction } : undefined;
    get<OTermsDict>(ontologiesUrl, queryParams, userParams ).then(
      res => resolve(res),
      err => reject(err)
    )
  });
}

export async function getOTerm(appContext: AppContext, value: string): Promise<OTermsDict> {
  return new Promise((resolve, reject) => {
    const params = appContext.mbUser ? { token: appContext.mbUser.token, authErrAction: appContext.authErrAction } : undefined;
    get<OTermsDict>(ontologiesUrl, { value } as OntologyQuery, params ).then(
      res => resolve(res),
      err => reject(err)
    )
  });
}

// Getting ontology info {{{1

function getInfo(appContext: AppContext, ontologyUri: string): Promise<OntologyTerm> {
  return new Promise((resolve, reject) => {
    const params = appContext.mbUser ? { token: appContext.mbUser.token, authErrAction: appContext.authErrAction } : undefined;
    get<OntologyTerm>(ontologiesUrl, { uri: ontologyUri } as OntologyQuery, params ).then(
      res => resolve(res),
      err => reject(err)
    )
  });
}

export function loadOntologiesInfo(appContext: AppContext, iris: Array<string>): Promise<Array<OntologyTerm>> {
  return new Promise((resolve, reject) => {
    const infoPms = iris.map((iri: string) => getInfo(appContext, iri));
    allSettled<oreg.OntologyTerm>(infoPms).then(
      (results) => {
        const settled = results.filter(r => r.status === "fulfilled") as Array<allSettled.PromiseResolution<oreg.OntologyTerm>>;
        const infos = settled.map(s  => s.value);
        if (infos.length === 0) {
          reject("No results returned");
        } else {
          resolve(infos);
        }
      }
    );
  });
}
