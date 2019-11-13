import * as React from "react";
import * as ReactDOM from "react-dom";
import { FaPlus } from "react-icons/fa";
import { Tabs, Tab } from "../../components";
import { SemanticAutocomplete } from "../../autocomplete/view";
import * as ac from "../../autocomplete/autocomplete";
import * as an from "../../shared/annotation";
import * as api from "../../api/annotations";
import { Context } from "../../widget/context";
import { showAlertSuccess, showAlertWarning, showAlertError } from "../../components"; 

type TabType = "semantic" | "keyword" | "comment";

const alertId = "anAlert";

function mkTarget(context: Context): an.AnTarget {
  return api.mkTarget({
      id: context.resource.pid, 
      source: context.resource.subject
    });
}

function mkCreator(context: Context): an.AnCreator {
  return api.mkCreator({
      id: context.user.id, 
      nickname: context.user.nickname
    });
}

interface Props {
  context: Context;
}

function Semantic(props: Props): React.FunctionComponentElement<Context> {
  const [uris, setUris] = React.useState([] as Array<string>);
  const [label, setLabel] = React.useState("");
  const [ref, setRef] = React.useState(null as any);

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    setUris(suggestions[0].items.map((i: ac.Item) => i.uris));
    setLabel(suggestions[0].labelOrig);
  }

  function annotate(): void {
    const body: an.AnBody = api.mkBody(uris, an.PurposeType.TAGGING, label);
    const target: an.AnTarget = mkTarget(props.context);
    const creator: an.AnCreator = mkCreator(props.context);
    const generator: an.AnGenerator = api.mkGenerator();
    const req: an.AnRecord = api.mkRequest(body, target, creator, generator, an.PurposeType.TAGGING);
    api.postAnnotation(req)
      .then(() => showAlertSuccess(alertId, "Semantic annotation created"))
      .catch(error => {
        if (error.response.data && error.response.data.message) {
          showAlertWarning(alertId, error.response.data.message);
        } else {
          showAlertError(alertId, "Failed: server error");
        }
      });
  }

  return (
    <div className="b2-container d-flex flex-row">
      <SemanticAutocomplete 
        ref={(comp) => setRef(comp)} 
        onChange={gotSuggestion}
      />
      <button type="button" className="btn btn-primary"
        disabled={label.length === 0}
        onClick={() => {
          annotate();
          if (ref) {
            ref.clear();
          }
        }}
      ><FaPlus/></button>
    </div>
  );
}

function Keyword(props: Props): React.FunctionComponentElement<{}> {
  const [label, setLabel] = React.useState("");

  function annotate(): void {
    const body: an.AnBody = api.mkBody([], an.PurposeType.TAGGING, label);
    const target: an.AnTarget = mkTarget(props.context);
    const creator: an.AnCreator = mkCreator(props.context);
    const generator: an.AnGenerator = api.mkGenerator();
    const req: an.AnRecord = api.mkRequest(body, target, creator, generator, an.PurposeType.TAGGING);
    api.postAnnotation(req)
    .then(() => {
      showAlertSuccess(alertId, "Keyword annotation created");
      setLabel("");
    })
      .catch(error => {
        if (error.response.data?.message) {
          showAlertWarning(alertId, error.response.data.message);
        } else {
          showAlertError(alertId, "Failed: server error");
        }
      });
  }

  return (
    <div className="b2-container d-flex flex-row">
      <input className="form-control"
        value={label}
        onChange={ev => setLabel(ev.target?.value || "")} 
      />
      <button type="button" className="btn btn-primary"
        disabled={label.length === 0}
        onClick={annotate}
      ><FaPlus/></button>
    </div>
  );
}

function Comment(props: Props): React.FunctionComponentElement<{}> {
  const [comment, setComment] = React.useState("");

  function annotate(): void {
    const body: an.AnBody = api.mkBody([], an.PurposeType.COMMENTING, comment);
    const target: an.AnTarget = mkTarget(props.context);
    const creator: an.AnCreator = mkCreator(props.context);
    const generator: an.AnGenerator = api.mkGenerator();
    const req: an.AnRecord = api.mkRequest(body, target, creator, generator, an.PurposeType.COMMENTING);
    api.postAnnotation(req)
    .then(() => {
      showAlertSuccess(alertId, "Comment created");
      setComment("");
    })
      .catch(error => {
        if (error.response.data?.message) {
          showAlertWarning(alertId, error.response.data.message);
        } else {
          showAlertError(alertId, "Failed: server error");
        }
      });
  }

  return (
    <div className="b2-container d-flex flex-row">
      <textarea className="form-control"
        value={comment}
        onChange={ev => setComment(ev.target?.value || "")} 
      />
      <button type="button" className="btn btn-primary"
        disabled={comment.length === 0}
        onClick={annotate}
      ><FaPlus/></button>
    </div>
  );
}

export function Annotate(props: Props): React.FunctionComponentElement<Context> {
  return (
    <div>
      <Tabs id="annotateTabs" activeTab={"semantic" as TabType}>
        <Tab tabId={"semantic" as TabType} title={<span>Semantic<br/>tag</span>}>
          <Semantic context={props.context}/>
        </Tab>
        <Tab tabId={"keyword" as TabType} title={<span>Fee-text<br/>keyword</span>}>
          <Keyword context={props.context}/>
        </Tab>
        <Tab tabId={"comment" as TabType} title={<span>Comment<br/>&nbsp;</span>}>
          <Comment context={props.context}/>
        </Tab>
      </Tabs>
      <div id={alertId}></div>
    </div>
  );
}

export function render(context: Context): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<Annotate context={context}/>, container);
  } else {
    console.error("#page element missing");
  }
}

