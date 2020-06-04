#!/bin/bash

# Create the config.js to provide client run-time config variables
C=server/public/widget/js/config.js
JS_WIDGET_SERVER_URL=`[ -z "$JS_WIDGET_SERVER_URL" ] && echo "http://localhost:3060" || echo "$JS_WIDGET_SERVER_URL"` 
JS_API_SERVER_URL=`[ -z "$JS_API_SERVER_URL" ] && echo "http://localhost:3060" || echo "$JS_API_SERVER_URL"` 
JS_API_PATH=`[ -z "$JS_API_PATH" ] && echo "/api" || echo "$JS_API_PATH"` 
JS_SOLR_URL=`[ -z "$JS_SOLR_URL" ] && echo "https://b2note.eudat.eu/solr/b2note_index/select" || echo "$JS_SOLR_URL"` 
echo -n "window.b2note = { widgetServerUrl: '"$JS_WIDGET_SERVER_URL"', apiServerUrl: '"$JS_API_SERVER_URL"', apiPath: '"$JS_API_PATH"', solrUrl: '"$JS_SOLR_URL"' };" > $C

echo "$C created"
echo "Starting the server..."

cd server; node server