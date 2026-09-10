#!/bin/bash
set -e

mkdir -p /app/data
chmod 777 /app/data

exec uvicorn main:app --host 0.0.0.0 --port 8000
