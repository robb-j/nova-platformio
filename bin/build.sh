#!/usr/bin/env zsh

# Ensure the build fails if TypeScript fails
set -e

curl -sL https://raw.githubusercontent.com/platformio/platformio-core-installer/v1.2.1/get-platformio.py > platformio.novaextension/get-platformio.py

npx tsc
