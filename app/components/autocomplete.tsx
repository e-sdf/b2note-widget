import _ from "lodash";
import * as React from "react";
import type { AppContext } from "app/context";
import type { OntologyTerm, OTermsDict } from "core/ontologyRegister";
import type { OntologySources } from "core/apiModels/ontologyQueryModel";
import { findOTerms } from "app/api/ontologyRegister";
import { AsyncTypeahead } from "react-bootstrap-typeahead";

export interface Suggestion {
  label: string;
  labelOrig?: string;
  items?: Array<OntologyTerm>;
  customOption?: boolean;
}

function mkSuggestion(item: OntologyTerm): Suggestion {
  return {
    label: item.label + " (" + item.ontologyAcronym + " " + item.shortForm + ")",
    labelOrig: item.label,
    items: [item]
  };
}

function aggregateGroup(group: Array<OntologyTerm>): Suggestion {
  return {
    label: group[0].label + " (" + group.length + ")",
    labelOrig: group[0].label,
    items: group
  };
}

function mkSuggestions(oDict: OTermsDict): Array<Suggestion> {
  const res: Array<Suggestion> = _.keys(oDict).map(oKey => {
    const og = oDict[oKey];
    return og.length > 1 ? aggregateGroup(og) : mkSuggestion(og[0]);
  });
  return res;
}


interface Props {
  appContext: AppContext;
  id: string;
  sources?: OntologySources;
  autoFocus?: boolean;
  defaultInputValue?: string;
  allowNew?: boolean;
  onChange: (val: Array<Suggestion>) => void;
  onSubmit?: () => void;
}

interface InputHandles {
  clear: () => void;
  focus: () => void;
}

export const SemanticAutocomplete = React.forwardRef((props: Props, ref: React.Ref<InputHandles>) => {
  const tRef = React.useRef(null);
  const [suggestions, setSuggestions] = React.useState([] as Array<Suggestion>);
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState([] as Array<Suggestion>);

  function clear(): void {
    if (tRef?.current) {
      (tRef.current as any).clear();
    }
  }

  function focus(): void {
    if (tRef?.current) {
      (tRef.current as any).focus();
    }
  }

  function toggleMenu(): void {
    if (tRef?.current) {
      (tRef.current as any).toggleMenu();
    }
  }

  React.useImperativeHandle(ref, () => ({
    clear,
    focus,
    toggleMenu
  }));

  return (
    <AsyncTypeahead
      id={props.id}
      ref={tRef}
      autoFocus={props.autoFocus || false}
      defaultInputValue={props.defaultInputValue}
      allowNew={props.allowNew || false}
      isLoading={loading}
      onSearch={query => {
        setLoading(true);
        findOTerms(props.appContext, query, props.sources)
        .then((termsDict) => {
          setLoading(false);
          setOptions(mkSuggestions(termsDict));
        });
      }}
      onChange={s => {setSuggestions(s); props.onChange(s)}}
      onKeyDown={ev => {if (props.onSubmit && suggestions.length > 0 && (ev as KeyboardEvent).code === "Enter") {props.onSubmit();}}}
      useCache={false}
      options={options}
    />
  );
});
