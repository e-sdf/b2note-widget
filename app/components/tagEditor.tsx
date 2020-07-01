import _ from "lodash";
import * as React from "react";
import * as icons from "./icons";
import * as anModel from "../core/annotationsModel";
import * as ac from "./autocomplete/view";

export interface TagEditorProps {
  annotation: anModel.Annotation;
  cancelledHandler(): void;
  updateHandler(newBody: anModel.AnBody): void;
}

export default function TagEditor(props: TagEditorProps): React.FunctionComponentElement<TagEditorProps> {
  const [uris, setUris] = React.useState([] as Array<string>);
  const [label, setLabel] = React.useState(anModel.getLabel(props.annotation));
  const [ref, setRef] = React.useState(null as any);

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    setUris((suggestions[0].items || []).map(i => i.uris));
    setLabel(suggestions[0].labelOrig || "");
  }

  function finish(): void {
    const anBody: anModel.AnBody = 
      anModel.isSemantic(props.annotation) ? anModel.mkSemanticAnBody(uris, label)
      : anModel.isKeyword(props.annotation) ? anModel.mkKeywordAnBody(label)
      : anModel.mkCommentAnBody(label);
    props.updateHandler(anBody);
  }

  React.useEffect(() => {
    if (ref) {
      ref.focus();
    }
  }, [ref]);

  return (
    <tr>
      <td colSpan={3}>
        <div className="d-flex flex-row">
          {anModel.isSemantic(props.annotation) ?
            <ac.SemanticAutocomplete 
              id="annotations-semantic-autocomplete"
              ref={(comp) => setRef(comp)} 
              defaultInputValue={label}
              onChange={gotSuggestion}
            />
          : <input type="text" className="form-control"
              value={label} 
              onChange={ev => setLabel(ev.target.value)}
            />
          }
          <button type="button" className="btn btn-primary"
            disabled={label.length === 0}
            onClick={() => {
              finish();
              if (ref) {
                ref.clear();
              }
            }}>
            <icons.SaveIcon/>
          </button>
          <button type="button" className="btn btn-danger"
            onClick={() => props.cancelledHandler()}>
            <icons.CancelIcon/>
          </button>
        </div>
        </td>
    </tr>
  );
}

