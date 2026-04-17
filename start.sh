#!/bin/bash
cd backend && node server.js &
BACKEND_PID=$!
cd frontend && npm start
wait $BACKEND_PID
