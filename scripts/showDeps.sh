#!/bin/bash

depcruise --include-only "^app" --output-type dot app | dot -Txdot > /tmp/deps.dot
xdot /tmp/deps.dot
