import allSettled from "promise.allsettled";
import type { OntologyInfo } from "../core/ontologyRegister";
import * as oreg from "../core/ontologyRegister";
import config from "../config";

export function loadOntologiesInfo(iris: Array<string>): Promise<Array<OntologyInfo>> {
  return new Promise((resolve, reject) => {
    const infoPms = iris.map((iri: string) => oreg.getInfo(config.solrUrl, iri));
    allSettled<oreg.OntologyInfo>(infoPms).then(
      (results) => {
        const settled = results.filter(r => r.status === "fulfilled") as Array<allSettled.PromiseResolution<oreg.OntologyInfo>>;
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
