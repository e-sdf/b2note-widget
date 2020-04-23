#!/bin/bash

P=`./scripts/utils/getPackage.sh`
N=`./scripts/utils/getName.sh`
V=`./scripts/utils/getVersion.sh`
B=`./scripts/utils/getBuild.sh`

docker tag "$P/$N" "$P/$N:$V-$B"
