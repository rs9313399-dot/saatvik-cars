#!/bin/bash
cd /home/z/my-project
while true; do
  echo "Starting Next.js dev server..."
  npx next dev -p 3000 2>&1
  echo "Server stopped. Restarting in 3s..."
  sleep 3
done
