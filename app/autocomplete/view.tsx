import * as _ from "lodash";
import * as React from "react";
import { OntologyItem, getOntologies } from "../core/ontologyRegister";
import { AsyncTypeahead } from "react-bootstrap-typeahead";

export interface Suggestion {
  label: string;
  labelOrig: string;
  items: Array<OntologyItem>;
}

function mkSuggestion(item: OntologyItem): Suggestion {
  return {
    label: item.labels + " (" + item.ontology_acronym + " " + item.short_form + ")",
    labelOrig: item.labels,
    items: [item]
  };
}

function aggregateGroup(group: Array<OntologyItem>): Suggestion {
  return {
    label: group[0].labels + " (" + group.length + ")",
    labelOrig: group[0].labels,
    items: group 
  };
}

function mkSuggestions(items: Array<OntologyItem>): Array<Suggestion> {
  const groups = _.groupBy(items, (i) => i.labels.toLowerCase());
  const res: Array<Suggestion> = _.keys(groups).map(gk => {
    const g = groups[gk];
    return g.length > 1 ? aggregateGroup(g) : mkSuggestion(g[0]);
  });
  //console.log(res);
  return res;
}


interface Props {
  id?: string;
  defaultInputValue?: string;
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

  public clear = () => {
    const ta = this.typeahead;
    if (ta) {
      ta.getInstance().clear();
    }
  }

  public focus = () => {
    const ta = this.typeahead;
    if (ta) {
      ta.getInstance().focus();
    }
  }

  public render = () => {
    return (
      <AsyncTypeahead
        id={this.props.id}
        ref={(typeahead) => this.typeahead = typeahead}
        defaultInputValue={this.props.defaultInputValue}
        isLoading={this.state.loading}
        onSearch={query => {
          this.setState({ loading: true });
          getOntologies(query)
          .then((resp) => {
            this.setState({ 
              loading: false,
              options: mkSuggestions(resp)
            });
          });
        }}
        onChange={this.props.onChange}
        options={this.state.options}
      />
    );
  }
}



