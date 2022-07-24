#!/bin/bash

# add npm dependencies to PATH
export PATH="$PATH:node_modules/.bin"

# build js
tsc --noEmit
esbuild src/typescript/game.ts --bundle --sourcemap --minify --outfile=build/main.js

# copy static files
cp -r src/static/* build

# serve locally
python3 -m http.server -d build
