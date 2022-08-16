#!/bin/bash

# add npm dependencies to PATH
export PATH="$PATH:node_modules/.bin"

# build js
if [ "$1" = "production" ];
then
    echo "Generating production build..."
    mkdir -p build
    rm build/*
    tsc --noEmit
    esbuild src/typescript/game.ts --bundle --minify --outfile=build/main.js
    cp -r src/static/* build
    echo "Production build finished. Files can be found in the build directory."
else
    esbuild src/typescript/game.ts --bundle --sourcemap --outfile=src/static/main.js --servedir=src/static
fi
