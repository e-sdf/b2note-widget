import _ from "lodash";
import * as React from "react";
import config from "../../config";
import type { OntologyInfo, OntologyDict } from "../../core/ontologyRegister";
import { getOntologies } from "../../core/ontologyRegister";
import { AsyncTypeahead } from "react-bootstrap-typeahead";

export interface Suggestion {
  label: string;
  labelOrig?: string;
  items?: Array<OntologyInfo>;
  customOption?: boolean;
}

function mkSuggestion(item: OntologyInfo): Suggestion {
  return {
    label: item.labels + " (" + item.ontologyAcronym + " " + item.shortForm + ")",
    labelOrig: item.labels,
    items: [item]
  };
}

function aggregateGroup(group: Array<OntologyInfo>): Suggestion {
  return {
    label: group[0].labels + " (" + group.length + ")",
    labelOrig: group[0].labels,
    items: group 
  };
}

function mkSuggestions(oDict: OntologyDict): Array<Suggestion> {
  const res: Array<Suggestion> = _.keys(oDict).map(oKey => {
    const og = oDict[oKey];
    return og.length > 1 ? aggregateGroup(og) : mkSuggestion(og[0]);
  });
  //console.log(res);
  return res;
}


interface Props {
  id: string;
  defaultInputValue?: string;
  allowNew?: boolean;
  onChange: (val: Array<Suggestion>) => void;
}

interface State {
  loading: boolean;
  options: Array<Suggestion>;
}

export class SemanticAutocomplete extends React.Component<Props, State> {

  private typeahead: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      options: []
    };
  }

  public clear = (): void => {
    const ta = this.typeahead;
    if (ta) {
      ta.clear();
    }
  }

  public focus = (): void => {
    const ta = this.typeahead;
    if (ta) {
      ta.focus();
    }
  }

  public render = (): React.ReactElement => {
    return (
      <AsyncTypeahead
        id={this.props.id}
        ref={(typeahead) => this.typeahead = typeahead}
        defaultInputValue={this.props.defaultInputValue}
        allowNew={this.props.allowNew || false}
        isLoading={this.state.loading}
        onSearch={query => {
          this.setState({ loading: true });
          getOntologies(config.solrUrl, query)
          .then((ontologiesDict) => {
            this.setState({ 
              loading: false,
              options: mkSuggestions(ontologiesDict)
            });
          });
        }}
        onChange={this.props.onChange}
        options={this.state.options}
      />
    );
  }
}



