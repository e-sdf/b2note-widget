import axios from "axios";
import * as secret from "../secret";
import { endpointUrl } from "./server";
import { Context } from "../widget/context";
import * as anModel from "../core/annotationsModel";
import * as sModel from "../core/searchModel";
import * as searchQueryParser from "../core/searchQueryParser";
import { Format } from '../../b2note-core/app/annotationsModel';

const annotationsUrl = endpointUrl + anModel.annotationsUrl;
const targetsUrl = endpointUrl + anModel.targetsUrl;
const searchUrl = endpointUrl + sModel.searchUrl;

export function postAnnotation(anRecord: anModel.AnRecord): Promise<any> {
  const config = { headers: {'Creatorization': "bearer " + secret.token} };
  return axios.post(annotationsUrl, anRecord, config);
}

export interface Filters {
  allFiles: boolean;
  creator: {
    mine: boolean;
    others: boolean;
  };
  type: {
    semantic: boolean;
    keyword: boolean;
    comment: boolean;
  };
  value?: string;
}

type Query = Record<string, any>;

function mkTypeFilter(f: Filters): Query {
  return {
    type: [ 
    ...(f.type.semantic ? [anModel.AnRecordType.SEMANTIC]: []), 
    ...(f.type.keyword ? [anModel.AnRecordType.KEYWORD]: []), 
    ...(f.type.comment ? [anModel.AnRecordType.COMMENT]: []) 
    ]
  };
}

function mkCreatorFilter(context: Context, f: Filters): Query {
  return !f.creator.others ? { creator: context.user.id } : {};
}

function mkTargetSourceFilter(context: Context, f: Filters): Query {
  return !f.allFiles ? { "target-source": context.target.source } : {};
}

function mkValueFilter(f: Filters): Query {
  return f.value ? { value: f.value } : {};
}

function mkQuery(context: Context, f: Filters, format: anModel.Format, download: boolean): Query {
  return {
    ...mkTypeFilter(f),
    ...mkCreatorFilter(context, f),
    ...mkTargetSourceFilter(context, f),
    ...mkValueFilter(f),
    format,
    download
  };
}

export function getAnnotationsJSON(context: Context, f: Filters, download = false): Promise<Array<anModel.AnRecord>> {
  const params = mkQuery(context, f, anModel.Format.JSONLD, download);
  return new Promise((resolve, reject) => {
    axios.get(annotationsUrl, { params }).then(res => {
      if(res.data) {
        const cleaned = !f.creator.mine ? 
          res.data.filter((r: anModel.AnRecord) => r.creator.id !== context.user.id)
        : res.data;
        resolve(cleaned);
      } else {
        reject(new Error("Empty data"));
      }
    },
    error => reject(error));
  });
}

export function getAnnotationsRDF(context: Context, f: Filters): Promise<string> {
  const params = mkQuery(context, f, anModel.Format.RDF, true);
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

export function getTargets(tag: string): Promise<Array<anModel.AnTarget>> {
  return new Promise((resolve, reject) => {
    axios.get(targetsUrl, { params: { tag } }).then(res => {
      if(res.data) {
        resolve(res.data);
      } else {
        reject(new Error("Empty data"));
      }
    },
    error => reject(error));
  });
}

export function searchAnnotations(query: anModel.SearchQuery): Promise<Array<anModel.AnRecord>> {
  const res = searchQueryParser.parse(query.expression);
  if (res.error) { throw new Error("Query expression parse error: " + res.error); }
  return new Promise((resolve, reject) => {
    axios.get(searchUrl, { params: query }).then(res => {
      if(res.data) {
        resolve(res.data);
      } else {
        reject(new Error("Empty data"));
      }
    },
    error => reject(error));
  });
}



