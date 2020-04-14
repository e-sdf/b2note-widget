#!/bin/bash

V=`./scripts/utils/getVersion.sh`

./scripts/utils/clean.sh
webpack --progress --config webpack.prod.js
