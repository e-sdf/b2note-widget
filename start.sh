#!/bin/bash

# Create the config.js to provide client run-time config variables
C=server/public/js/config.js
JS_SERVER_URL=`[ -z "$JS_SERVER_URL" ] && echo "http://localhost:3060" || echo "$JS_SERVER_URL"` 
JS_SOLR_URL=`[ -z "$JS_SOLR_URL" ] && echo "https://b2note.eudat.eu/solr/b2note_index/select" || echo "$JS_SOLR_URL"` 
echo -n "window.b2note = { serverUrl: '"$JS_SERVER_URL"', solrUrl: '"$JS_SOLR_URL"' };" > $C

echo "$C created"
echo "Starting the server..."

cd server; npm run start