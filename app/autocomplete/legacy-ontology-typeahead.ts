// Functions from original Django JS file
// Used for testing the new implementation

export function prepare(query: string): string {
  var url = 'https://b2note.bsc.es/solr/cleanup_test/select';
  if ((query.length<=4) && (query.split(/[^A-Za-z0-9]/).length<=1)) {
    //console.log("Less than four letters single word input")
    url += '?q=((labels:/' + query +'.*/)';
  } else {
    //console.log("More than four letters or mutliple words input")
    url += '?q=((labels:"' + query +'"^100%20OR%20labels:' + query +'*^20%20OR%20text_auto:/' + query +'.*/^10%20OR%20labels:*' + query + '*)';
  }
  url += '%20AND%20NOT%20(labels:/Error[0-9].*/))'
    if (query.split(/[^A-Za-z0-9]/).length<=1) {
      //alert("single-word");
      url += '&sort=norm(labels) desc';
    }
    url += '&fl=labels,uris,ontology_acronym,short_form,synonyms,norm(labels)&wt=json&indent=true&rows=1000';
    return url;
}

