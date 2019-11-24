import * as an from "../shared/annotationsModel";
import * as rq from "./annotations";

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
        },
        {
          "type": "TextualBody",
          "value": "text"
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
      "name": "B2Note v3.0"
    }
  };
  const body: an.AnBody = rq.mkBody(["url1", "url2"], an.PurposeType.TAGGING, "text");
  const target: an.AnTarget = rq.mkTarget({id: "testTargetId", source: "testSource"});
  const creator: an.AnCreator = rq.mkCreator({id: "testCreatorID", nickname: "testCreatorNickName"});
  const generator: an.AnGenerator = rq.mkGenerator();
  const req: an.AnRecord = rq.mkRequest(body, target, creator, generator, an.PurposeType.TAGGING);
  delete req.created;
  delete req.generated;
  expect(req).toMatchObject(result);
});

