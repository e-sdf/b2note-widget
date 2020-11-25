import type { ConfRec } from "app/config";
import { endpointUrl } from "app/config";
import type { SysContext, AppContext, AuthUser } from "app/context";
import * as targets from "app/targets";
import type { AuthErrAction } from "core/http";
import { get, post, patch, del } from "core/http";
import * as anModel from "core/annotationsModel";
import * as formats from "core/formats";
import * as qModel from "core/apiModels/anQueryModel";
import * as sModel from "core/searchModel";
import * as searchQueryParser from "core/searchQueryParser";

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
    ...(f.type.semantic ? [anModel.AnBodyType.SEMANTIC]: []),
    ...(f.type.keyword ? [anModel.AnBodyType.KEYWORD]: []),
    ...(f.type.comment ? [anModel.AnBodyType.COMMENT]: [])
    ]
  };
}

function mkCreatorFilter(user: AuthUser, f: Filters): Query {
  return !f.creator.others ? { creator: user.profile.id } : {};
}

function mkTargetFilter(target: targets.Target, f: Filters): Query {
  return (
    !f.allFiles ? {
      "target-id": [target.pid],
      ... (target.type === "LinkTarget" || target.type === "ImageOnPageSelectionTarget") && target.source ? { "target-source": [target.source] } : {}
    }
    : {}
  );
}

function mkValueFilter(f: Filters): Query {
  return f.value ? { value: f.value } : {};
}

function mkQuery(f: Filters, mbUser: AuthUser|null, mbTarget: targets.Target|null, format: formats.FormatType, download: boolean): Query {
  const creatorFilter = mbUser ? mkCreatorFilter(mbUser, f) : {};
  const targetFilter = mbTarget ? mkTargetFilter(mbTarget, f) : {};
  return {
    ...mkTypeFilter(f),
    ...creatorFilter,
    ...targetFilter,
    ...mkValueFilter(f),
    format,
    download
  };
}

export function getAnnotationsJSON(sysContext: SysContext, appContext: AppContext, f: Filters, download = false): Promise<Array<anModel.Annotation>> {
  const mbUser = appContext.mbUser;
  const mbTarget = sysContext.mbTarget;
  const params = mkQuery(f, mbUser, mbTarget, formats.FormatType.JSONLD, download);
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

export function getAnnotationsRDF(sysContext: SysContext, appContext: AppContext, f: Filters): Promise<string> {
  const params = mkQuery(f, appContext.mbUser, sysContext.mbTarget, formats.FormatType.RDF, true);
  return get(annotationsUrl, params);
}

// Creating annotations {{{1

export interface AnnotationPostRecord {
  target: targets.Target;
  user: AuthUser;
  visibility: anModel.VisibilityEnum;
  authErrAction: AuthErrAction;
}

export interface SematicAnnotationPostRecord extends AnnotationPostRecord {
  uris: string[];
  value: string;
}

export interface KeywordAnnotationPostRecord extends AnnotationPostRecord {
  value: string;
}

export interface CommentAnnotationPostRecord extends AnnotationPostRecord {
  comment: string;
}

export interface TripleAnnotationPostRecord extends AnnotationPostRecord {
  triple: anModel.Triple;
}

function postAnnotation(annotation: anModel.Annotation, user: AuthUser, authErrAction: AuthErrAction): Promise<any> {
  return post<anModel.Annotation>(annotationsUrl, annotation, { token: user.token, authErrAction });
}

export async function postAnnotationSemantic(config: ConfRec, {target, user, uris, value, visibility, authErrAction}: SematicAnnotationPostRecord): Promise<any> {
  const anTarget = targets.mkTarget(target);
  const body = anModel.mkSemanticAnBody(uris, value);
  const generator = anModel.mkGenerator(config.name, config.version, config.homepage);
  const creator = anModel.mkCreator({id: user.profile.id});
  const req = anModel.mkAnnotation(body, anTarget, creator, generator, anModel.PurposeType.TAGGING, visibility);
  return postAnnotation(req, user, authErrAction);
}

export async function postAnnotationKeyword(config: ConfRec, {target, user, value, visibility, authErrAction}: KeywordAnnotationPostRecord): Promise<any> {
  const anTarget = targets.mkTarget(target);
  const body = anModel.mkKeywordAnBody(value);
  const creator = anModel.mkCreator({id: user.profile.id});
  const generator = anModel.mkGenerator(config.name, config.version, config.homepage);
  const req = anModel.mkAnnotation(body, anTarget, creator, generator, anModel.PurposeType.TAGGING, visibility);
  return postAnnotation(req, user, authErrAction);
}

export async function postAnnotationComment(config: ConfRec, {target, user, comment, visibility, authErrAction}: CommentAnnotationPostRecord): Promise<any> {
  const anTarget = targets.mkTarget(target);
  const body = anModel.mkCommentAnBody(comment);
  const creator = anModel.mkCreator({id: user.profile.id});
  const generator = anModel.mkGenerator(config.name, config.version, config.homepage);
  const req = anModel.mkAnnotation(body, anTarget, creator, generator, anModel.PurposeType.COMMENTING, visibility);
  return postAnnotation(req, user, authErrAction);
}


// Changing annotatations {{{1

export function patchAnnotationBody(user: AuthUser, anIdUrl: string, body: anModel.AnBody, authErrAction: AuthErrAction): Promise<any> {
  return patch(anIdUrl, { body: body as any }, { token: user.token, authErrAction });
}

export function changeAnVisibility(user: AuthUser, anIdUrl: string, visibility: anModel.VisibilityEnum, authErrAction: AuthErrAction): Promise<any> {
  return patch(anIdUrl, { visibility }, { token: user.token, authErrAction });
}
//
// Deleting annotations {{{1

export function deleteAnnotation(user: AuthUser, anIdUrl: string, authErrAction: AuthErrAction): Promise<any> {
  return del(anIdUrl, { token: user.token, authErrAction });
}

// Getting targets {{{1

export function getTargets(tag: string): Promise<Array<anModel.AnTarget>> {
  return get(targetsUrl, { tag });
}

// Searching annotations {{{1

export function searchAnnotations(expression: qModel.SearchQuery): Promise<Array<anModel.Annotation>> {
  const res = searchQueryParser.parse(expression);
  return (
    res.error ?
      Promise.reject("Query expression parse error: " + res.error.message)
    : get(searchUrl, { expression })
  );
}

// Resolving source URL {{{1

export function resolveSourceFilename(handleUrl: string): Promise<string> {
  return get<string>(resolveSourceUrl, { handleUrl });
}
