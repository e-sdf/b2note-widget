#!/bin/bash

V=`./scripts/utils/getVersion.sh`
sed -i -e "/version:/s/\"\\(.*\\)\"/\"v${V}\"/" app/config.ts
git commit -am "release"