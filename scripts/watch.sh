#!/bin/bash

./scripts/utils/clean.sh
cp -rv ./server ./dist/
npx webpack --watch --progress --config webpack.dev.js
