import * as React from "react";
import * as ReactDOM from "react-dom";
import { FaPlus } from "react-icons/fa";
import { Tabs, Tab } from "../../components/ui";
import * as oreg from "../../core/ontologyRegister";
import * as ac from "../../components/autocomplete/view";
import * as api from "../../api/annotations";
import { Context } from "../../components/context";
import { showAlertSuccess, showAlertWarning, showAlertError } from "../../components/ui"; 

const alertId = "anAlert";

interface SemanticProps {
  context: Context;
}

function Semantic(props: SemanticProps): React.FunctionComponentElement<SemanticProps> {
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
    api.postAnnotationSemantic(uris, label, props.context)
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
    <div className="d-flex flex-row" style={{margin: "10px"}}>
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

interface KeywordProps {
  context: Context;
}

function Keyword(props: KeywordProps): React.FunctionComponentElement<KeywordProps> {
  const [label, setLabel] = React.useState("");
  const [uris, setUris] = React.useState([] as Array<string>);
  const [semanticFound, setSemanticFound] = React.useState(false);

  function postAnnotation(): void {
    api.postAnnotationKeyword(label, props.context)
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

  function postAnnotationAsSemantic(): void {
    api.postAnnotationSemantic(uris, label, props.context)
      .then(() => {
        showAlertSuccess(alertId, "Semantic annotation created");
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

  function annotate(): void {
    oreg.getOntologies(label).then(oDict => {
      if (oDict[label]) {
        setUris(oDict[label].map(i => i.uris));
        setSemanticFound(true);
      } else {
        postAnnotation();
      }
    });
  }

  function renderSemantisationDialog(): React.ReactElement {
    return (
      <div style={{ margin: "15px" }}>
        <p>
          We found semantic terms matching the keyword.
          </p>
        <p>
          Would you like to select one or carry on with free-text?
          </p>
        <div className="d-flex flex-row justify-content-between" style={{ margin: "10px" }}>
          <button type="button" className="btn btn-primary"
            onClick={() => {
              setSemanticFound(false);
              postAnnotationAsSemantic();
            }}>
            Semantic
            </button>
          <button type="button" className="btn btn-secondary"
            onClick={() => {
              setSemanticFound(false);
              postAnnotation();
            }}>
            Keyword
            </button>
          <button type="button" className="btn btn-warning"
            onClick={() => setSemanticFound(false)}>
            Cancel
            </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-row" style={{margin: "10px"}}>
        <input className="form-control"
          value={label}
          onChange={ev => setLabel(ev.target?.value || "")} 
        />
        <button type="button" className="btn btn-primary"
          disabled={label.length === 0}
          onClick={annotate}>
          <FaPlus/>
        </button>
      </div>
      {semanticFound ? renderSemantisationDialog() : <></>}
    </div>
  );
}

interface CommentProps {
  context: Context;
}

function Comment(props: CommentProps): React.FunctionComponentElement<CommentProps> {
  const [comment, setComment] = React.useState("");

  function annotate(): void {
    api.postAnnotationComment(comment, props.context)
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
    <div className="d-flex flex-row" style={{margin: "10px"}}>
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

enum TabType { SEMANTIC = "semantic", KEYWORD = "keyword", COMMENT = "comment" }

interface PageProps {
  context: Context;
}

export function AnnotatePage(props: PageProps): React.FunctionComponentElement<PageProps> {
  const [activeTab, setActiveTab] = React.useState(TabType.SEMANTIC);

  return (
    <>
      <Tabs key={activeTab} id="annotateTabs" activeTab={activeTab} activeHandle={setActiveTab}> 
        <Tab tabId={TabType.SEMANTIC} title={<span>Semantic<br/>tag</span>}>
          <Semantic context={props.context}/>
        </Tab>
        <Tab tabId={TabType.KEYWORD} title={<span>Fee-text<br/>keyword</span>}>
          <Keyword context={props.context}/>
        </Tab>
        <Tab tabId={TabType.COMMENT} title={<span>Comment<br/>&nbsp;</span>}>
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

