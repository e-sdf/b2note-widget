#!/bin/bash

./scripts/utils/clean.sh
./scripts/updateVersion.sh
cp -rv ./server ./dist/
npx webpack --progress --config webpack.prod.js
