import axios from "axios";
import * as secret from "../secret";
import * as server from "./server";
import * as an from "../../shared/annotation";

const url = server.url + "/annotations";

export function mkBody(sources: Array<string>): an.AnBody {
  const items: Array<an.AnItem> = sources.map(source => ({
    type: "SpecificResource",
    source
  }));
  return {
    items,
    purpose: "tagging",
    type: "Composite"
  };
}

export function mkTarget(obj: {id: string, source: string}): an.AnTarget {
  return { ...obj, type: "SpecificResource" }; 
}

export function mkCreator(obj: {id: string, nickname: string}): an.AnCreator {
  return { ...obj, type: "Person" };
}

export function mkGenerator(): an.AnGenerator {
  return {
    type: "Software",
    homepage: "https://b2note.bsc.es/b2note/",
    name: "B2Note v2.0"
  };
}

export function mkRequest(body: an.AnBody, target: an.AnTarget, creator: an.AnCreator, generator: an.AnGenerator): an.AnRecord {
  const ts = an.mkTimestamp();
  return {
    "@context": "http://www.w3.org/ns/anno/jsonld",
    body,
    target,
    created: ts,
    creator,
    generated: ts,
    generator,
    id: "",
    motivation: "tagging",
    type: "Annotation"
  };
}

export function postAnnotation(body: an.AnRecord): Promise<any> {
  const config = { headers: {'Authorization': "bearer " + secret.token} };
  return axios.post(url, body, config);
}
