import config from "../config";
import type { AuthUser } from "../context";
import type { AuthErrAction } from "./http";
import { get, post, patch, del } from "./http";
import * as anModel from "../core/annotationsModel";
import * as sModel from "../core/searchModel";
import * as searchQueryParser from "../core/searchQueryParser";

const endpointUrl = config.apiServerUrl + config.apiPath;

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
    ...(f.type.semantic ? [anModel.AnnotationType.SEMANTIC]: []), 
    ...(f.type.keyword ? [anModel.AnnotationType.KEYWORD]: []), 
    ...(f.type.comment ? [anModel.AnnotationType.COMMENT]: []) 
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

export function getAnnotationsJSON(f: Filters, mbUser: AuthUser|null = null, mbTarget: anModel.Target|null = null, download = false): Promise<Array<anModel.Annotation>> {
  const params = mkQuery(f, mbUser, mbTarget, anModel.Format.JSONLD, download);
  return new Promise((resolve, reject) => {
    get<Array<anModel.Annotation>>(annotationsUrl, params).then(
      data => {
        const cleaned = !f.creator.mine ? 
          data.filter((r: anModel.Annotation) => anModel.getCreatorId(r) !== mbUser?.profile.id)
        : data;
        resolve(cleaned);
      },
      err => reject(err)
    );
  });
}

export function getAnnotationsRDF(f: Filters, mbUser: AuthUser|null = null, mbTarget: anModel.Target|null = null): Promise<string> {
  const params = mkQuery(f, mbUser, mbTarget, anModel.Format.RDF, true);
  return get(annotationsUrl, params);
}

// Creating annotations {{{1

export interface AnnotationInfo {
  target: anModel.Target;
  user: AuthUser;
  visibility: anModel.VisibilityEnum;
  authErrAction: AuthErrAction;
}

export interface SematicAnnotationInfo extends AnnotationInfo {
  uris: string[];
  label: string;
}

export interface KeywordAnnotationInfo extends AnnotationInfo {
  label: string;
}

export interface CommentAnnotationInfo extends AnnotationInfo {
  comment: string;
}

function postAnnotation(annotation: anModel.Annotation, user: AuthUser, authErrAction: AuthErrAction): Promise<any> {
  return post<anModel.Annotation>(annotationsUrl, annotation, { token: user.token, authErrAction });
}

export async function postAnnotationSemantic({target, user, uris, label, visibility, authErrAction}: SematicAnnotationInfo): Promise<any> {
  const body = anModel.mkSemanticAnBody(uris, label);
  const anTarget = anModel.mkTarget(target);
  const generator = anModel.mkGenerator(config.version);
  const creator = anModel.mkCreator({id: user.profile.id});
  const req = anModel.mkAnnotation(body, anTarget, creator, generator, anModel.PurposeType.TAGGING, visibility);
  return postAnnotation(req, user, authErrAction);
}

export async function postAnnotationKeyword({target, user, label, visibility, authErrAction}: KeywordAnnotationInfo): Promise<any> {
  const body = anModel.mkKeywordAnBody(label);
  const anTarget = anModel.mkTarget(target);
  const creator = anModel.mkCreator({id: user.profile.id});
  const generator = anModel.mkGenerator(config.version);
  const req = anModel.mkAnnotation(body, anTarget, creator, generator, anModel.PurposeType.TAGGING, visibility);
  return postAnnotation(req, user, authErrAction);
}

export async function postAnnotationComment({target, user, comment, visibility, authErrAction}: CommentAnnotationInfo): Promise<any> {
  const body = anModel.mkCommentAnBody(comment);
  const anTarget = anModel.mkTarget(target);
  //TODO: privacy choices handling
  const creator = anModel.mkCreator({id: user.profile.id});
  const generator = anModel.mkGenerator(config.version);
  const req = anModel.mkAnnotation(body, anTarget, creator, generator, anModel.PurposeType.COMMENTING, visibility);
  return postAnnotation(req, user, authErrAction);
}

// Changing annotatations {{{1

export function patchAnnotationBody(user: AuthUser, anIdUrl: string, body: anModel.AnBody, authErrAction: AuthErrAction): Promise<any> {
  return patch(anIdUrl, { body: body as any }, { token: user.token, authErrAction });
}

// Deleting annotations {{{1

export function deleteAnnotation(user: AuthUser, anIdUrl: string, authErrAction: AuthErrAction): Promise<any> {
  return del(anIdUrl, { token: user.token, authErrAction });
}

// Getting targets {{{1

export function getTargets(tag: string): Promise<Array<anModel.AnTarget>> {
  return get(targetsUrl, { tag });
}

// Searching annotations {{{1

export function searchAnnotations(expression: anModel.SearchQuery): Promise<Array<anModel.Annotation>> {
  const res = searchQueryParser.parse(expression);
  return (
    res.error ?
      Promise.reject("Query expression parse error: " + res.error)
    : get(searchUrl, { expression })
  );
}

// Resolving source URL {{{1

export function resolveSourceFilename(handleUrl: string): Promise<string> {
  return get<string>(resolveSourceUrl, { handleUrl });
}