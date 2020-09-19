import _ from "lodash";
import * as React from "react";
import type { OntologyTerm, OTermsDict } from "core/ontologyRegister";
import { getOTerms } from "core/ontologyRegister";
import { AsyncTypeahead } from "react-bootstrap-typeahead";

export interface Suggestion {
  label: string;
  labelOrig?: string;
  items?: Array<OntologyTerm>;
  customOption?: boolean;
}

function mkSuggestion(item: OntologyTerm): Suggestion {
  return {
    label: item.labels + " (" + item.ontologyAcronym + " " + item.shortForm + ")",
    labelOrig: item.labels,
    items: [item]
  };
}

function aggregateGroup(group: Array<OntologyTerm>): Suggestion {
  return {
    label: group[0].labels + " (" + group.length + ")",
    labelOrig: group[0].labels,
    items: group
  };
}

function mkSuggestions(oDict: OTermsDict): Array<Suggestion> {
  const res: Array<Suggestion> = _.keys(oDict).map(oKey => {
    const og = oDict[oKey];
    return og.length > 1 ? aggregateGroup(og) : mkSuggestion(og[0]);
  });
  //console.log(res);
  return res;
}


interface Props {
  solrUrl: string;
  id: string;
  autoFocus?: boolean;
  defaultInputValue?: string;
  allowNew?: boolean;
  onChange: (val: Array<Suggestion>) => void;
}

interface InputHandles {
  clear: () => void;
  focus: () => void;
}

export const SemanticAutocomplete = React.forwardRef((props: Props, ref: React.Ref<InputHandles>) => {
  const tRef = React.useRef(null);
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
        getOTerms(props.solrUrl, query)
        .then((termsDict) => {
          setLoading(false);
          setOptions(mkSuggestions(termsDict));
        });
      }}
      onChange={props.onChange}
      options={options}
    />
  );
});
