#!/bin/bash

source ./scripts/schemas/generateSchema.sh
IF="`pwd`/b2note-core/src/core/targetInput.ts"
OD="`pwd`/b2note-core/src/core/schemas/"

T="TargetInput"
generateSchema
