import * as React from "react";
import * as ReactDOM from "react-dom";
import axios from "axios";
import { AsyncTypeahead, TypeaheadLabelKey } from "react-bootstrap-typeahead";
import * as ac from "./autocomplete";

interface Props {
  id?: string;
  onChange: (val: Array<ac.Suggestion>) => void;
}

interface State {
  loading: boolean;
  options: Array<ac.Suggestion>;
}

export class SemanticAutocomplete extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      options: []
    };
  }

  public render = () => {
    return (
      <AsyncTypeahead
	id={this.props.id}
	isLoading={this.state.loading}
	onSearch={query => {
	  this.setState({ loading: true });
	  axios.get(ac.makeSolrUrl(query))
	    .then((resp) => {
	      this.setState({ 
		loading: false,
	        options: ac.mkSuggestions(resp.data.response.docs)
	      });
	    });
	}}
	onChange={this.props.onChange}
	options={this.state.options}
      />
    );
  }
}



