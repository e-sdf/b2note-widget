import axios from "axios";
import { endpointUrl } from "../config";
import type { Context } from "../context";
import * as anModel from "../core/annotationsModel";
import * as sModel from "../core/searchModel";
import * as searchQueryParser from "../core/searchQueryParser";
import { makeLocalUrl, authHeader } from "./utils";
import { axiosErrToMsg } from "../core/utils";

const annotationsUrl = endpointUrl + anModel.annotationsUrl;
const targetsUrl = endpointUrl + anModel.targetsUrl;
const resolveSourceUrl = endpointUrl + anModel.resolveSourceUrl;
const searchUrl = endpointUrl + sModel.searchUrl;

// Getting annotations

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
  return !f.creator.others ? { creator: context.user?.id || "" } : {};
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
    axios.get(annotationsUrl, { params })
    .then(resp => {
      if(resp.data) {
        const cleaned = !f.creator.mine ? 
          resp.data.filter((r: anModel.AnRecord) => r.creator.id !== (context.user?.id || ""))
        : resp.data;
        resolve(cleaned);
      } else {
        reject(new Error("Empty data"));
      }
    })
    .catch(error => reject(axiosErrToMsg(error)));
  });
}

export function getAnnotationsRDF(context: Context, f: Filters): Promise<string> {
  const params = mkQuery(context, f, anModel.Format.RDF, true);
  return new Promise((resolve, reject) => {
    axios.get(annotationsUrl, { params })
    .then(resp => {
      if(resp.data) {
        resolve(resp.data);
      } else {
        reject(new Error("Empty data"));
      }
    })
    .catch(error => reject(axiosErrToMsg(error)));
  });
}

// Creating annotations

function mkTarget(target: anModel.Target): anModel.AnTarget {
  return anModel.mkTarget({
      id: target.pid, 
      source: target.source
  });
}

function mkCreator(context: Context): anModel.AnCreator {
  const mbUser = context.user;
  if (mbUser) {
    return anModel.mkCreator(mbUser.id);
  } else {
    throw new Error("User not logged");
  }
}

async function postAnnotation(anRecord: anModel.AnRecord, context: Context): Promise<any> {
  return new Promise((resolve, reject) => {
    const mbUser = context.user;
    if (mbUser) {
      axios.post(annotationsUrl, anRecord, authHeader(mbUser.accessToken))
      .then(resp => resolve(resp.data))
      .catch(error => reject(axiosErrToMsg(error)));
    } else {
      reject("User not logged");
    }
  });
}

export async function postAnnotationSemantic(uris: string[], label: string, context: Context): Promise<any> {
  const body = anModel.mkSemanticAnBody(uris, label);
  const target = mkTarget(context.target);
  const generator = anModel.mkGenerator();
  const creator = mkCreator(context);
  const req = anModel.mkAnRecord(body, target, creator, generator, anModel.PurposeType.TAGGING);
  return postAnnotation(req, context);
}

export async function postAnnotationKeyword(label: string, context: Context): Promise<any> {
  const body = anModel.mkKeywordAnBody(label);
  const target = mkTarget(context.target);
  const creator = mkCreator(context);
  const generator = anModel.mkGenerator();
  const req = anModel.mkAnRecord(body, target, creator, generator, anModel.PurposeType.TAGGING);
  return postAnnotation(req, context);
}

export async function postAnnotationComment(comment: string, context: Context): Promise<any> {
  const body = anModel.mkCommentAnBody(comment);
  const target = mkTarget(context.target);
  const creator = mkCreator(context);
  const generator = anModel.mkGenerator();
  const req = anModel.mkAnRecord(body, target, creator, generator, anModel.PurposeType.COMMENTING);
  return postAnnotation(req, context);
}

// Changing annotatations

export function patchAnnotationBody(anIdUrl: string, body: anModel.AnBody, context: Context): Promise<any> {
  return new Promise((resolve, reject) => {
    if (context.user) {
      axios.patch(makeLocalUrl(anIdUrl), { body }, authHeader(context.user.accessToken))
      .then(resp => resolve(resp))
      .catch(error => reject(axiosErrToMsg(error)));
    } else {
      reject("Token not present");
    }
  });
}

// Deleting annotations

export function deleteAnnotation(anIdUrl: string, context: Context): Promise<any> {
  return new Promise((resolve, reject) => {
    if (context.user) {
      axios.delete(makeLocalUrl(anIdUrl), authHeader(context.user.accessToken))
        .then(resp => resolve(resp))
        .catch(error => reject(axiosErrToMsg(error)));
    } else {
      reject("Token not present");
    }
  });
}

// Getting targets

export function getTargets(tag: string): Promise<Array<anModel.AnTarget>> {
  return new Promise((resolve, reject) => {
    axios.get(targetsUrl, { params: { tag } })
    .then(resp => {
      if(resp.data) {
        resolve(resp.data);
      } else {
        reject("Empty data");
      }
    })
    .catch(error => reject(axiosErrToMsg(error)));
  });
}

// Searching annotations

export function searchAnnotations(query: anModel.SearchQuery): Promise<Array<anModel.AnRecord>> {
  return new Promise((resolve, reject) => {
    const res = searchQueryParser.parse(query.expression);
    if (res.error) { reject("Query expression parse error: " + res.error); }
    axios.get(searchUrl, { params: query })
    .then(res => {
      if(res.data) {
        resolve(res.data);
      } else {
        reject(new Error("Empty data"));
      }
    })
    .catch(error => reject(axiosErrToMsg(error)));
  });
}

// Resolving source URL

export function resolveSourceFilename(handleUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    axios.get<string>(resolveSourceUrl, { params: { handleUrl }})
    .then(res => resolve(res.data))
    .catch(error => reject(axiosErrToMsg(error)));
  });
}