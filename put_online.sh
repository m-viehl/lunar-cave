#!/bin/bash
scp build/main.html coruscant:to_put_online/lunar.html
scp build/main.js coruscant:to_put_online/main.js
ssh coruscant ./put_online.sh

