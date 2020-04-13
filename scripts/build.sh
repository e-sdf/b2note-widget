#!/bin/bash

./scripts/utils/clean.sh
webpack --progress --config webpack.prod.js
