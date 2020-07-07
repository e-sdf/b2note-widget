import * as anModel from "../core/annotationsModel";

export interface TagRecord {
  tag: string;
  anType: anModel.AnnotationType;
  annotations: Array<anModel.Annotation>;
  showAnnotationsFlag: boolean;
}

type TagIndex = Record<string, Array<anModel.Annotation>>;

function mkKey(tag: string, anType: anModel.AnnotationType): string {
  return tag + "_" + anType;
}

function groupByTag(anl: Array<anModel.Annotation>): [Array<string>, TagIndex] {
  const index = {} as TagIndex;
  const tags = new Set<string>();
  anl.forEach(
    an => {
      tags.add(anModel.getLabel(an));
      const tag = anModel.getLabel(an);
      const anType = anModel.getAnType(an);
      const key = mkKey(tag, anType);
      const ans = index[key];
      if (ans) {
        index[key] = [...ans, an];
      } else {
        index[key] = [an];
      }
    }
  );
  return [Array.from(tags), index];
}

export function mkTagRecords(anl: Array<anModel.Annotation>): Array<TagRecord> {
  const [tags, tagIndex] = groupByTag(anl);
  return tags.reduce(
    (res, tag) => {
      const semantic = tagIndex[mkKey(tag, anModel.AnnotationType.SEMANTIC)];
      const keyword = tagIndex[mkKey(tag, anModel.AnnotationType.KEYWORD)];
      const comment = tagIndex[mkKey(tag, anModel.AnnotationType.COMMENT)];
      const semanticItem = semantic ?
        [{ 
        tag,
        anType: anModel.AnnotationType.SEMANTIC,
        annotations: semantic,
        showAnnotationsFlag: false
      }] : [];
      const keywordItem = keyword ?
        [{ 
        tag,
        anType: anModel.AnnotationType.KEYWORD,
        annotations: keyword,
        showAnnotationsFlag: false
      }] : [];
      const commentItem = comment ?
        [{ 
        tag,
        anType: anModel.AnnotationType.COMMENT,
        annotations: comment,
        showAnnotationsFlag: false
      }] : [];
      return [...res, ...semanticItem, ...keywordItem, ...commentItem];
    },
    [] as Array<TagRecord>
  );
}

