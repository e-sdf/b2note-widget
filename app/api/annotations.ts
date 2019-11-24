import * as _ from "lodash";
import axios from "axios";
import * as secret from "../secret";
import { endpointUrl } from "./server";
import { Context } from "../widget/context";
import * as anModel from "../shared/annotationsModel";

const annotationsUrl = endpointUrl + anModel.annotationsUrl;
const filesUrl = endpointUrl + anModel.filesUrl;

export function mkBody(sources: Array<string>, purpose: anModel.PurposeType, text: string): anModel.AnBody {
  const items: Array<anModel.AnItem> = _.concat(
    sources.map(source => ({
      type: anModel.BodyItemType.SPECIFIC_RESOURCE,
      source
    } as anModel.AnItem)),
    {
      type: anModel.BodyItemType.TEXTUAL_BODY,
      value: text
    } as anModel.AnItem
  );
  return {
    items,
    purpose,
    type: "Composite"
  };
}

export function mkTarget(obj: {id: string; source: string}): anModel.AnTarget {
  return { ...obj, type: anModel.BodyItemType.SPECIFIC_RESOURCE }; 
}

export function mkCreator(obj: {id: string; nickname: string}): anModel.AnCreator {
  return { ...obj, type: "Person" };
}

export function mkGenerator(): anModel.AnGenerator {
  return {
    type: "Software",
    homepage: "https://b2note.bsc.es/b2note/",
    name: "B2Note v3.0"
  };
}

export function mkRequest(body: anModel.AnBody, target: anModel.AnTarget, creator: anModel.AnCreator, generator: anModel.AnGenerator, motivation: anModel.PurposeType): anModel.AnRecord {
  const ts = anModel.mkTimestamp();
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

export function postAnnotation(body: anModel.AnRecord): Promise<any> {
  const config = { headers: {'Creatorization': "bearer " + secret.token} };
  return axios.post(annotationsUrl, body, config);
}

export interface Filters {
  allFilesFilter: boolean;
  creatorFilter: [boolean, boolean];
  typeFilter: [boolean, boolean, boolean];
}

function mkFilterArray<T>(filterEnum: Record<string, T>, flags: Array<boolean>): Array<T> {
  const res: Array<T> = [];
  Object.keys(filterEnum).map((k, i) => { if (flags[i]) { res.push(filterEnum[k]); } });
  return res;
}

export function getAnnotations(context: Context, f: Filters): Promise<Array<anModel.AnRecord>> {
  const creatorParam = mkFilterArray(anModel.CreatorFilter, f.creatorFilter);
  const typeParam = mkFilterArray(anModel.TypeFilter, f.typeFilter);
  const params: anModel.GetQuery = {
    user: context.user.id,
    "target-source": f.allFilesFilter ? undefined : context.resource.source,
    "creator-filter": creatorParam.length > 0 ? creatorParam : undefined,
    "type-filter": typeParam.length > 0 ? typeParam : undefined
  };

  return new Promise((resolve, reject) => {
    axios.get(annotationsUrl, { params }).then(res => {
      if(res.data) {
        resolve(res.data);
      } else {
        reject(new Error("Empty data"));
      }
    },
    error => reject(error));
  });
}

function makeLocalUrl(url: string): string {
  return url.replace("https://b2note.bsc.es", "http://localhost:3050");
}

export function deleteAnnotation(anIdUrl: string): Promise<any> {
  return axios.delete(makeLocalUrl(anIdUrl));
}

export function getFiles(tag: string): Promise<Array<string>> {
  const params: anModel.FilesQuery = { tag };
  return new Promise((resolve, reject) => {
    axios.get(filesUrl, { params }).then(res => {
      if(res.data) {
        resolve(res.data);
      } else {
        reject(new Error("Empty data"));
      }
    },
    error => reject(error));
  });
}

