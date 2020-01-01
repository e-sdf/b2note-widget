import * as React from "react";
import * as ReactDOM from "react-dom";
import { FaPlus } from "react-icons/fa";
import { Tabs, Tab } from "../../components/ui";
import * as ac from "../../autocomplete/view";
import * as anModel from "../../core/annotationsModel";
import * as api from "../../api/annotations";
import { Context } from "../../components/context";
import { showAlertSuccess, showAlertWarning, showAlertError } from "../../components/ui"; 

const alertId = "anAlert";

function mkTarget(context: Context): anModel.AnTarget {
  return anModel.mkTarget({
      id: context.target.pid, 
      source: context.target.source
  });
}

function mkCreator(context: Context): anModel.AnCreator {
  return anModel.mkCreator({
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
    if (suggestions.length > 0) {
      //console.log(suggestions);
      setLabel(suggestions[0].labelOrig);
      setUris(suggestions[0].items.map(i => i.uris));
    } else {
      setLabel("");
      setUris([]);
    }
  }

  function annotate(): void {
    const body = anModel.mkSemanticAnBody(uris, label);
    const target = mkTarget(props.context);
    const creator = mkCreator(props.context);
    const generator = anModel.mkGenerator();
    const req = anModel.mkAnRecord(body, target, creator, generator, anModel.PurposeType.TAGGING);
    api.postAnnotation(req)
      .then(() => showAlertSuccess(alertId, "Semantic annotation created"))
      .catch(error => {
        if (error.response?.data?.message) {
          showAlertWarning(alertId, error.response.data.message);
        } else {
          showAlertError(alertId, "Failed: server error");
        }
      });
  }

  return (
    <div className="b2-container d-flex flex-row">
      <ac.SemanticAutocomplete 
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
    const body = anModel.mkKeywordAnBody(label);
    const target = mkTarget(props.context);
    const creator = mkCreator(props.context);
    const generator = anModel.mkGenerator();
    const req = anModel.mkAnRecord(body, target, creator, generator, anModel.PurposeType.TAGGING);
    api.postAnnotation(req)
    .then(() => {
      showAlertSuccess(alertId, "Keyword annotation created");
      setLabel("");
    })
    .catch((error: any) => {
      console.error(error);
      if (error?.response?.data?.message) {
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
    const body = anModel.mkCommentAnBody(comment);
    const target = mkTarget(props.context);
    const creator = mkCreator(props.context);
    const generator = anModel.mkGenerator();
    const req = anModel.mkAnRecord(body, target, creator, generator, anModel.PurposeType.COMMENTING);
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

type TabType = "semantic" | "keyword" | "comment";

export function AnnotatePage(props: Props): React.FunctionComponentElement<Context> {
  return (
    <>
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
    </>
  );
}

export function render(context: Context): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<AnnotatePage context={context}/>, container);
  } else {
    console.error("#page element missing");
  }
}

