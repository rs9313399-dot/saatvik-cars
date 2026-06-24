#!/bin/bash
cd /home/z/my-project
while true; do
  node node_modules/.bin/next dev -p 3000 > dev.log 2>&1
  sleep 3
done
