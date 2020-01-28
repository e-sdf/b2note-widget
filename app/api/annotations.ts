import axios from "axios";
import { endpointUrl } from "./server";
import { Context } from "../components/context";
import * as anModel from "../core/annotationsModel";
import * as sModel from "../core/searchModel";
import * as searchQueryParser from "../core/searchQueryParser";
import { makeLocalUrl, authHeader } from "./utils";

const annotationsUrl = endpointUrl + anModel.annotationsUrl;
const targetsUrl = endpointUrl + anModel.targetsUrl;
const searchUrl = endpointUrl + sModel.searchUrl;

function mkTarget(context: Context): anModel.AnTarget {
  return anModel.mkTarget({
      id: context.target.pid, 
      source: context.target.source
  });
}

function mkCreator(context: Context): anModel.AnCreator {
  return anModel.mkCreator({
      id: context.user?.id || "", 
      nickname: context.user?.name || ""
    });
}

function postAnnotation(anRecord: anModel.AnRecord, token: string|undefined): Promise<any> {
  if (token) {
    return axios.post(annotationsUrl, anRecord, authHeader(token));
  } else {
    return Promise.reject("Token not present");
  }
}

export function postAnnotationSemantic(uris: string[], label: string, context: Context): Promise<any> {
  const body = anModel.mkSemanticAnBody(uris, label);
  const target = mkTarget(context);
  const creator = mkCreator(context);
  const generator = anModel.mkGenerator();
  const req = anModel.mkAnRecord(body, target, creator, generator, anModel.PurposeType.TAGGING);
  return postAnnotation(req, context.user?.accessToken);
}

export function postAnnotationKeyword(label: string, context: Context): Promise<any> {
  const body = anModel.mkKeywordAnBody(label);
  const target = mkTarget(context);
  const creator = mkCreator(context);
  const generator = anModel.mkGenerator();
  const req = anModel.mkAnRecord(body, target, creator, generator, anModel.PurposeType.TAGGING);
  return postAnnotation(req, context.user?.accessToken);
}

export function postAnnotationComment(comment: string, context: Context): Promise<any> {
  const body = anModel.mkCommentAnBody(comment);
  const target = mkTarget(context);
  const creator = mkCreator(context);
  const generator = anModel.mkGenerator();
  const req = anModel.mkAnRecord(body, target, creator, generator, anModel.PurposeType.COMMENTING);
  return postAnnotation(req, context.user?.accessToken);
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
    axios.get(annotationsUrl, { params }).then(res => {
      if(res.data) {
        const cleaned = !f.creator.mine ? 
          res.data.filter((r: anModel.AnRecord) => r.creator.id !== (context.user?.id || ""))
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

export function patchAnnotationBody(anIdUrl: string, body: anModel.AnBody, context: Context): Promise<any> {
  if (context.user) {
    return axios.patch(makeLocalUrl(anIdUrl), { body }, authHeader(context.user.accessToken));
  } else {
    return Promise.reject("Token not present");
  }
}

export function deleteAnnotation(anIdUrl: string, context: Context): Promise<any> {
  if (context.user) {
    return axios.delete(makeLocalUrl(anIdUrl), authHeader(context.user.accessToken));
  } else {
    return Promise.reject("Token not present");
  }
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

// export function getSourceFilename(target: Target): Promise<string|null> {
//   const handleURL = "http://hdl.handle.net/api/handles/; 
// }

