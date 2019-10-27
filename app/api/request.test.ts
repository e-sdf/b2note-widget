import * as rq from "./request";

const timeStampRegex = /[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]\.[0-9]+/;

test("timestamp is generated", () => {
  const ts = rq.mkTimestamp();
  expect(ts).toMatch(timeStampRegex);
});

test("mkRequest works", () => {
  const result = 
    {
    "@context": "http://www.w3.org/ns/anno/jsonld",
    "id": "",
    "type": "Annotation",
    "body": {
      "type": "Composite",
      "purpose": "tagging",
      "items": [
	{
	  "type": "SpecificResource",
	  "source": "url1"
	},
	{
	  "type": "SpecificResource",
	  "source": "url2"
	}
      ]
    },
    "target": {
      "id": "testTargetId",
      "type": "SpecificResource",
      "source": "testSource"
    },
    "motivation": "tagging",
    "creator": {
      "id": "testCreatorID",
      "type": "Person",
      "nickname": "testCreatorNickName"
    },
    "generator": {
      "type": "Software",
      "homepage": "https://b2note.bsc.es/b2note/",
      "name": "B2Note v2.0"
    }
  };
  const body: rq.AnBody = rq.mkBody(["url1", "url2"]);
  const target: rq.AnTarget = rq.mkTarget({id: "testTargetId", source: "testSource"});
  const creator: rq.AnCreator = rq.mkCreator({id: "testCreatorID", nickname: "testCreatorNickName"});
  const generator: rq.AnGenerator = rq.mkGenerator();
  const req: rq.AnnotateReq = rq.mkRequest(body, target, creator, generator);
  expect(req.created).toMatch(timeStampRegex);
  expect(req.generated).toMatch(timeStampRegex);
  delete req.created;
  delete req.generated;
  expect(req).toMatchObject(result);
});

