#!/bin/bash
(cd backend && BACKEND_PORT=3001 node server.js) &
echo "Waiting for backend to start..."
until curl -sf http://0.0.0.0:3001/api/health > /dev/null 2>&1; do
  sleep 1
done
echo "Backend is ready, starting frontend..."
cd frontend && BROWSER=none PORT=5000 HOST=0.0.0.0 npm start
