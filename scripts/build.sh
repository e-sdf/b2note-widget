#!/bin/bash

./scripts/utils/clean.sh
./scripts/updateVersion.sh
webpack --progress --config webpack.prod.js
