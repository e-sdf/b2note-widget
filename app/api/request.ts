
export interface AnItem {
  source: string;
  type: string;
}

export interface AnBody {
  items: Array<AnItem>;
  purpose: string;
  type: string;
}

export interface AnCreator {
  id: string;
  type: string;
  nickname: string;
}

export interface AnGenerator {
  type: string;
  homepage: string;
  name: string;
}

export interface AnTarget {
  id: string;
  source: string;
  type: string;
}

export interface AnnotateReq {
  "@context": string;
  body: any;
  created: string;
  creator: AnCreator;
  generated: string;
  generator: AnGenerator;
  id: string;
  motivation: string;
  target: AnTarget;
  type: string;
}

export function mkTimestamp(): string {
  const twoDigits = (n: string): string => n.length === 1 ? "0" + n : n;
  const d = new Date();
  const yyyy = d.getFullYear().toString();
  const mm = twoDigits(d.getMonth().toString());
  const dd = twoDigits(d.getDate().toString());
  const hh = twoDigits(d.getHours().toString());
  const mi = twoDigits(d.getMinutes().toString());
  const ss = twoDigits(d.getSeconds().toString());
  const ms = d.getMilliseconds().toString();
  return yyyy + "-" + mm + "-" + dd +
    "T" + hh + ":" + mi + ":" + ss + "." + ms;
}

export function mkBody(sources: Array<string>): AnBody {
  const items: Array<AnItem> = sources.map(source => ({
    type: "SpecificResource",
    source
  }));
  return {
    items,
    purpose: "tagging",
    type: "Composite"
  };
}

export function mkTarget(obj: {id: string, source: string}): AnTarget {
  return { ...obj, type: "SpecificResource" }; 
}

export function mkCreator(obj: {id: string, nickname: string}): AnCreator {
  return { ...obj, type: "Person" };
}

export function mkGenerator(): AnGenerator {
  return {
    type: "Software",
    homepage: "https://b2note.bsc.es/b2note/",
    name: "B2Note v2.0"
  };
}

export function mkRequest(body: AnBody, target: AnTarget, creator: AnCreator, generator: AnGenerator): AnnotateReq {
  const ts = mkTimestamp();
  return {
    "@context": "http://www.w3.org/ns/anno/jsonld",
    body,
    target,
    created: ts,
    creator,
    generated: ts,
    generator,
    id: "",
    motivation: "tagging",
    type: "Annotation"
  };
}
