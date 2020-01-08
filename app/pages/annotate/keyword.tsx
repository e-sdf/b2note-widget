import * as React from "react";
import { FaPlus } from "react-icons/fa";
import { Context } from "../../components/context";
import { showAlertSuccess, showAlertWarning, showAlertError } from "../../components/ui"; 
import * as oreg from "../../core/ontologyRegister";
import * as api from "../../api/annotations";

export interface KeywordProps {
  context: Context;
  alertId: string;
}

export function Keyword(props: KeywordProps): React.FunctionComponentElement<KeywordProps> {
  const [label, setLabel] = React.useState("");
  const [uris, setUris] = React.useState([] as Array<string>);
  const [semanticFound, setSemanticFound] = React.useState(false);

  function postAnnotation(): void {
    api.postAnnotationKeyword(label, props.context)
      .then(() => {
        showAlertSuccess(props.alertId, "Keyword annotation created");
        setLabel("");
      })
      .catch((error: any) => {
        console.error(error);
        if (error?.response?.data?.message) {
          showAlertWarning(props.alertId, error.response.data.message);
        } else {
          showAlertError(props.alertId, "Failed: server error");
        }
      });
  }

  function postAnnotationAsSemantic(): void {
    api.postAnnotationSemantic(uris, label, props.context)
      .then(() => {
        showAlertSuccess(props.alertId, "Semantic annotation created");
        setLabel("");
      })
      .catch((error: any) => {
        console.error(error);
        if (error?.response?.data?.message) {
          showAlertWarning(props.alertId, error.response.data.message);
        } else {
          showAlertError(props.alertId, "Failed: server error");
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
    <>
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
    </>
  );
}
