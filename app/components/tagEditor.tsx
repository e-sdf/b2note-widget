import { matchSwitch } from "@babakness/exhaustive-type-checking";
import type { AppContext } from "app/context";
import * as React from "react";
import * as icons from "./icons";
import * as anModel from "core/annotationsModel";
import * as ac from "./autocomplete";

export interface TagEditorProps {
  appContext: AppContext;
  cancelledHandler(): void;
}

export interface AnBodyTagEditorProps extends TagEditorProps {
  anBody: anModel.AnBody;
  updateHandler(newBody: anModel.AnBody): void;
}

export function AnBodyTagEditor(props: AnBodyTagEditorProps): React.FunctionComponentElement<AnBodyTagEditorProps> {
  const [uris, setUris] = React.useState([] as Array<string>);
  const [label, setLabel] = React.useState(anModel.getLabelFromBody(props.anBody));

  const inputRef = React.useRef(null as any);

  function gotSuggestion(suggestions: Array<ac.Suggestion>): void {
    setUris((suggestions[0].items || []).map(i => i.uris));
    setLabel(suggestions[0].labelOrig || "");
  }

  function finish(): void {
    const b = props.anBody;
    const newBody: anModel.AnBody|null =
     anModel.isSemanticAnBody(b) ? anModel.mkSemanticAnBody(uris, label)
     : anModel.isKeywordAnBody(b) ? anModel.mkKeywordAnBody(label)
     : anModel.isCommentAnBody(b) ? anModel.mkCommentAnBody(label)
     : null;
      if (newBody) {
        props.updateHandler(newBody);
      } else {
        console.error("Update error: BodyTagEditor cannot update " + anModel.getAnBodyType(props.anBody));
      }
  }

  React.useEffect(() => {
    if (inputRef?.current) { inputRef.current.focus(); }
  }, [inputRef]);

  function renderInput(): React.ReactElement {
    return matchSwitch(anModel.getAnBodyType(props.anBody), {
      [anModel.AnBodyType.SEMANTIC]: () =>
        <ac.SemanticAutocomplete
          ref={inputRef}
          appContext={props.appContext}
          id="anBodys-semantic-autocomplete"
          defaultInputValue={label}
          onChange={gotSuggestion}
        />,
      [anModel.AnBodyType.KEYWORD]: () =>
        <input type="text" className="form-control"
          value={label}
          onChange={ev => setLabel(ev.target.value)}
        />,
      [anModel.AnBodyType.COMMENT]: () =>
        <textarea className="form-control"
          value={label}
          onChange={ev => setLabel(ev.target.value)}
        />,
        [anModel.AnBodyType.TRIPLE]: () => <></>,
        [anModel.AnBodyType.UNKNOWN]: () => <></>
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
