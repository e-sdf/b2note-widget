#!/bin/bash

./scripts/utils/clean.sh
webpack --watch --progress --config webpack.dev.js
