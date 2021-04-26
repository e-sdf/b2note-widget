#!/bin/bash

# Create the config.js to provide client run-time config variables
C=dist/server/public/widget/js/config.js
JS_API_SERVER_URL=`[ -z "$JS_API_SERVER_URL" ] && echo "http://localhost:3060" || echo "$JS_API_SERVER_URL"`
JS_API_PATH=`[ -z "$JS_API_PATH" ] && echo "/api" || echo "$JS_API_PATH"`
JS_WIDGET_URL=`[ -z "$JS_WIDGET_URL" ] && echo "http://localhost:3061/widget" || echo "$JS_WIDGET_URL"`
JS_SOLR_URL=`[ -z "$JS_SOLR_URL" ] && echo "https://b2note.eudat.eu/solr/b2note_index/select" || echo "$JS_SOLR_URL"`
JS_CUSTOM_ONTOLOGIES=`[ -z "$JS_CUSTOM_ONTOLOGIES" ] && echo "false" || echo "$JS_CUSTOM_ONTOLOGIES"`
echo -n "window.b2note = { widgetUrl: '"$JS_WIDGET_URL"', apiServerUrl: '"$JS_API_SERVER_URL"', apiPath: '"$JS_API_PATH"', solrUrl: '"$JS_SOLR_URL"', customOntologies: "$JS_CUSTOM_ONTOLOGIES" };" > $C

echo "$C created"