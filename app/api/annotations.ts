import axios from "axios";
import { endpointUrl } from "../config";
import type { AuthUser } from "./auth";
import { version } from "../config";
import * as anModel from "../core/annotationsModel";
import * as sModel from "../core/searchModel";
import * as searchQueryParser from "../core/searchQueryParser";
import { mkAuthHeader } from "./auth";
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

function mkCreatorFilter(user: AuthUser, f: Filters): Query {
  return !f.creator.others ? { creator: user.profile.id } : {};
}

function mkTargetSourceFilter(target: anModel.Target, f: Filters): Query {
  return !f.allFiles ? { "target-source": target.source } : {};
}

function mkValueFilter(f: Filters): Query {
  return f.value ? { value: f.value } : {};
}

function mkQuery(f: Filters, mbUser: AuthUser|null, mbTarget: anModel.Target|null, format: anModel.Format, download: boolean): Query {
  const creatorFilter = mbUser ? mkCreatorFilter(mbUser, f) : {};
  const targetSourceFilter = mbTarget ? mkTargetSourceFilter(mbTarget, f) : {};
  return {
    ...mkTypeFilter(f),
    ...creatorFilter,
    ...targetSourceFilter,
    ...mkValueFilter(f),
    format,
    download
  };
}

export function getAnnotationsJSON(f: Filters, mbUser: AuthUser|null = null, mbTarget: anModel.Target|null = null, download = false): Promise<Array<anModel.AnRecord>> {
  const params = mkQuery(f, mbUser, mbTarget, anModel.Format.JSONLD, download);
  return new Promise((resolve, reject) => {
    axios.get(annotationsUrl, { params })
    .then(resp => {
      if(resp.data) {
        const cleaned = !f.creator.mine ? 
          resp.data.filter((r: anModel.AnRecord) => r.creator.id !== mbUser?.profile.id)
        : resp.data;
        resolve(cleaned);
      } else {
        reject(new Error("Empty data"));
      }
    })
    .catch(error => reject(axiosErrToMsg(error)));
  });
}

export function getAnnotationsRDF(f: Filters, mbUser: AuthUser|null = null, mbTarget: anModel.Target|null = null): Promise<string> {
  const params = mkQuery(f, mbUser, mbTarget, anModel.Format.RDF, true);
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

async function postAnnotation(anRecord: anModel.AnRecord, user: AuthUser): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.post(annotationsUrl, anRecord, mkAuthHeader(user.token))
    .then(resp => resolve(resp.data))
    .catch(error => reject(axiosErrToMsg(error)));
  });
}

export async function postAnnotationSemantic(target: anModel.Target, user: AuthUser, uris: string[], label: string): Promise<any> {
  const body = anModel.mkSemanticAnBody(uris, label);
  const anTarget = anModel.mkTarget(target);
  const generator = anModel.mkGenerator(version);
  const creator = anModel.mkCreator({id: user.profile.id});
  const req = anModel.mkAnRecord(body, anTarget, creator, generator, anModel.PurposeType.TAGGING);
  return postAnnotation(req, user);
}

export async function postAnnotationKeyword(target: anModel.Target, user: AuthUser, label: string): Promise<any> {
  const body = anModel.mkKeywordAnBody(label);
  const anTarget = anModel.mkTarget(target);
  const creator = anModel.mkCreator({id: user.profile.id});
  const generator = anModel.mkGenerator(version);
  const req = anModel.mkAnRecord(body, anTarget, creator, generator, anModel.PurposeType.TAGGING);
  return postAnnotation(req, user);
}

export async function postAnnotationComment(target: anModel.Target, user: AuthUser, comment: string): Promise<any> {
  const body = anModel.mkCommentAnBody(comment);
  const anTarget = anModel.mkTarget(target);
  //TODO: privacy choices handling
  const creator = anModel.mkCreator({id: user.profile.id});
  const generator = anModel.mkGenerator(version);
  const req = anModel.mkAnRecord(body, anTarget, creator, generator, anModel.PurposeType.COMMENTING);
  return postAnnotation(req, user);
}

// Changing annotatations

export function patchAnnotationBody(user: AuthUser, anIdUrl: string, body: anModel.AnBody): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.patch(anIdUrl, { body }, mkAuthHeader(user.token))
    .then(resp => resolve(resp))
    .catch(error => reject(axiosErrToMsg(error)));
  });
}

// Deleting annotations

export function deleteAnnotation(user: AuthUser, anIdUrl: string): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.delete(anIdUrl, mkAuthHeader(user.token))
      .then(resp => resolve(resp))
      .catch(error => reject(axiosErrToMsg(error)));
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