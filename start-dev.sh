#!/bin/bash
# Robust dev server launcher — restarts next if it exits
cd /home/z/my-project
while true; do
  /home/z/my-project/node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  echo "[start-dev] next exited with code $? at $(date), restarting in 2s..." >> /home/z/my-project/dev.log
  sleep 2
done
