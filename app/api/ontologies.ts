import allSettled from "promise.allsettled";
import type { OntologyTerm } from "core/ontologyRegister";
import * as oreg from "core/ontologyRegister";

export function loadOntologiesInfo(solrUrl: string, iris: Array<string>): Promise<Array<OntologyTerm>> {
  return new Promise((resolve, reject) => {
    const infoPms = iris.map((iri: string) => oreg.getInfo(solrUrl, iri));
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
