import * as _ from "lodash";
import axios from "axios";
import * as secret from "../secret";
import * as server from "./server";
import { Context } from "../widget/context";
import * as an from "../shared/annotation";

const url = server.url + "/v1/annotations";

export function mkBody(sources: Array<string>, purpose: an.PurposeType, text: string): an.AnBody {
  const items: Array<an.AnItem> = _.concat(
    sources.map(source => ({
      type: an.BodyItemType.SPECIFIC_RESOURCE,
      source
    } as an.AnItem)),
    {
      type: an.BodyItemType.TEXTUAL_BODY,
      value: text
    } as an.AnItem
  );
  return {
    items,
    purpose,
    type: "Composite"
  };
}

export function mkTarget(obj: {id: string; source: string}): an.AnTarget {
  return { ...obj, type: an.BodyItemType.SPECIFIC_RESOURCE }; 
}

export function mkCreator(obj: {id: string; nickname: string}): an.AnCreator {
  return { ...obj, type: "Person" };
}

export function mkGenerator(): an.AnGenerator {
  return {
    type: "Software",
    homepage: "https://b2note.bsc.es/b2note/",
    name: "B2Note v2.0"
  };
}

export function mkRequest(body: an.AnBody, target: an.AnTarget, creator: an.AnCreator, generator: an.AnGenerator, motivation: an.PurposeType): an.AnRecord {
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
    motivation,
    type: "Annotation"
  };
}

export function postAnnotation(body: an.AnRecord): Promise<any> {
  const config = { headers: {'Creatorization': "bearer " + secret.token} };
  return axios.post(url, body, config);
}

export interface Filters {
  allFilesFilter: boolean;
  creatorFilter: [boolean, boolean];
  typeFilter: [boolean, boolean, boolean];
}

function mkFilterArray(filterEnum: Record<string, string>, flags: Array<boolean>): Array<string> {
  const res: Array<string> = [];
  Object.keys(filterEnum).map((k, i) => { if (flags[i]) { res.push(filterEnum[k]); } });
  return res;
}

export function getAnnotations(context: Context, f: Filters): Promise<Array<an.AnRecord>> {
  const creatorParam = mkFilterArray(an.CreatorFilter, f.creatorFilter);
  const typeParam = mkFilterArray(an.TypeFilter, f.typeFilter);
  //TODO: make params type safe
  const params = { user: context.user.id };
  if (!f.allFilesFilter) { Object.assign(params, { "target-source": context.resource.source }); }
  if (creatorParam.length > 0) { Object.assign(params, { "creator-filter": creatorParam }); }
  if (typeParam.length > 0) { Object.assign(params, { "type-filter": typeParam }); }

  return new Promise((resolve, reject) => {
    axios.get(url, { params }).then(res => {
      if(res.data) {
        resolve(res.data);
      } else {
        reject(new Error("Empty data"));
      }
    },
    error => reject(error));
  });
}
