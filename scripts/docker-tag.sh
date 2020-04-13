#!/bin/bash

P=`./scripts/utils/getPackage.sh`
N=`./scripts/utils/getName.sh`
V=`./scripts/utils/getVersion.sh`

docker tag "$P/$N" "$P/$N:$V"
