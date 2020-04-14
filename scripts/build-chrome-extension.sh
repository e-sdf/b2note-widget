#!/bin/bash

D="./chrome-extension"

./scripts/utils/clean.sh

webpack --progress --config webpack.prod.js
cp -rfv ./server/public/widget/* $D

# Create the config.js to provide client run-time config variables
C=$D/js/config.js
JS_SERVER_URL="https://b2note.bsc.es"
JS_SOLR_URL="https://b2note.eudat.eu/solr/b2note_index/select"
echo -n "window.b2note = { chromeExtension: true, serverUrl: '"$JS_SERVER_URL"', solrUrl: '"$JS_SOLR_URL"' };" > $C
