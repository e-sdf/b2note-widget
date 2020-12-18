#!/bin/bash

echo "Cleaning schemas"
rm -rf ./b2note-core/src/core/schemas
mkdir ./b2note-core/src/core/schemas
# Dummy files run to make the compiler happy
./scripts/schemas/generateTargetInputSchemas.sh
# Actual files run
./scripts/schemas/generateTargetInputSchemas.sh