import * as _ from "lodash";
import { solrUrl } from "../api/solr";

export interface Item {
   short_form: string;
   labels: string;
   ontology_acronym: string;
   uris: string;
   "norm(labels)": number;
}

export function makeSolrUrl(query: string): string {
  const q = 
    (query.length <= 4 && _.words(query).length <= 1) ? `(labels:/${query}.*/)`
    : `(labels:"${query}"^100%20OR%20labels:${query}*^20%20OR%20text_auto:/${query}.*/^10%20OR%20labels:*${query}*)`;
  const notErrors = "%20AND%20NOT%20(labels:/Error[0-9].*/)";
  const sort = _.words(query).length <= 1 ? "&sort=norm(labels) desc" : "";
  const flags = "&fl=labels,uris,ontology_acronym,short_form,synonyms,norm(labels)&wt=json&indent=true&rows=1000";
  const res = solrUrl + "?q=(" + q + notErrors + ")" + sort + flags;
  console.log(res);
  return res;
}

export interface Suggestion {
  label: string;
  labelOrig: string;
  items: Array<Item>;
}

function mkSuggestion(item: Item): Suggestion {
  return {
    label: item.labels + " (" + item.ontology_acronym + " " + item.short_form + ")",
    labelOrig: item.labels,
    items: [item]
  };
}

function aggregateGroup(group: Array<Item>): Suggestion {
  return {
    label: group[0].labels + " (" + group.length + ")",
    labelOrig: group[0].labels,
    items: group 
  };
}

export function mkSuggestions(items: Array<Item>): Array<Suggestion> {
  const groups = _.groupBy(items, (i) => i.labels.toLowerCase());
  const res: Array<Suggestion> = _.keys(groups).map(gk => {
    const g = groups[gk];
    return g.length > 1 ? aggregateGroup(g) : mkSuggestion(g[0]);
  });
  //console.log(res);
  return res;
}

