import * as ac from "./autocomplete";
import * as orig from "./legacy-ontology-typeahead";

test("url with one word", () => {
  const query = "axon";
  const urlOld = orig.prepare(query);
  const urlNew = ac.makeSolrUrl(query);
  console.log(urlNew);
  expect(urlNew).toBe(urlOld);
});

test("url with two words", () => {
  const query = "axon regulation";
  const urlOld = orig.prepare(query);
  const urlNew = ac.makeSolrUrl(query);
  console.log(urlNew);
  expect(urlNew).toBe(urlOld);
});
