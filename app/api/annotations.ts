import * as _ from "lodash";
import axios from "axios";
import * as secret from "../secret";
import { endpointUrl } from "./server";
import { Context } from "../widget/context";
import * as anModel from "../shared/annotationsModel";
import * as sModel from "../shared/searchModel";

const annotationsUrl = endpointUrl + anModel.annotationsUrl;
const filesUrl = endpointUrl + anModel.filesUrl;
const searchUrl = endpointUrl + sModel.searchUrl;

export function postAnnotation(anRecord: anModel.AnRecord): Promise<any> {
  const config = { headers: {'Creatorization': "bearer " + secret.token} };
  return axios.post(annotationsUrl, anRecord, config);
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

export function patchAnnotationBody(anIdUrl: string, body: anModel.AnBody): Promise<any> {
  const config = { headers: {'Creatorization': "bearer " + secret.token} };
  return axios.patch(makeLocalUrl(anIdUrl), { body }, config);
}

export function deleteAnnotation(anIdUrl: string): Promise<any> {
  return axios.delete(makeLocalUrl(anIdUrl));
}

export function getFiles(tag: string): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    axios.get(filesUrl, { params: { tag } }).then(res => {
      if(res.data) {
        resolve(res.data);
      } else {
        reject(new Error("Empty data"));
      }
    },
    error => reject(error));
  });
}

export function searchAnnotations(query: sModel.SearchQuery): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    axios.get(searchUrl, { params: { query: JSON.stringify(query) } }).then(res => {
      if(res.data) {
        resolve(res.data);
      } else {
        reject(new Error("Empty data"));
      }
    },
    error => reject(error));
  });
}

