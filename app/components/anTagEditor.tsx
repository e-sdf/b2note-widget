import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import * as icons from "./icons";
import * as anModel from "core/annotationsModel";
import * as ac from "./autocomplete";

export interface TagEditorProps {
  solrUrl: string;
  annotation: anModel.Annotation;
  cancelledHandler(): void;
  updateHandler(newBody: anModel.AnBody): void;
}

export default function TagEditor(props: TagEditorProps): React.FunctionComponentElement<TagEditorProps> {
  const [uris, setUris] = React.useState([] as Array<string>);
  const [label, setLabel] = React.useState(anModel.getLabel(props.annotation));

  const inputRef = React.useRef(null as any);

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
    if (inputRef?.current) { inputRef.current.focus(); }
  }, [inputRef]);

  function renderInput(): React.ReactElement {
    return matchSwitch(anModel.getAnType(props.annotation), {
      [anModel.AnnotationType.SEMANTIC]: () =>
        <ac.SemanticAutocomplete
          ref={inputRef}
          id="annotations-semantic-autocomplete"
          solrUrl={props.solrUrl}
          defaultInputValue={label}
          onChange={gotSuggestion}
        />,
      [anModel.AnnotationType.KEYWORD]: () =>
        <input type="text" className="form-control"
          value={label}
          onChange={ev => setLabel(ev.target.value)}
        />,
      [anModel.AnnotationType.COMMENT]: () =>
        <textarea className="form-control"
          value={label}
          onChange={ev => setLabel(ev.target.value)}
        />,
        [anModel.AnnotationType.TRIPLE]: () => <></>,
        [anModel.AnnotationType.UNKNOWN]: () => <></>
    });
  }

  function renderActionButtons(): React.ReactElement {
    return (
      <div className="btn-group">
        <button type="button" className="btn btn-primary"
          disabled={label.length === 0}
          onClick={() => {
            finish();
            if (inputRef?.current) { inputRef.current.clear(); }
          }}>
          <icons.SaveIcon/>
        </button>
        <button type="button" className="btn btn-secondary"
          onClick={() => props.cancelledHandler()}>
          <icons.CancelIcon/>
        </button>
      </div>
    );
}

  return (
    <div className="d-flex flex-row">
      {renderInput()}
      {renderActionButtons()}
    </div>
  );
}
