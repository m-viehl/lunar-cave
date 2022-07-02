#!/bin/bash
scp build/index.html coruscant:to_put_online/index.html
scp build/main.js coruscant:to_put_online/main.js
ssh coruscant ./put_online.sh

