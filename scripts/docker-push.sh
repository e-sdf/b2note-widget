#!/bin/bash

P=`./scripts/utils/getPackage.sh`
N=`./scripts/utils/getName.sh`

docker push "$P/$N"
