#!/bin/bash
# 24/7 Start Script with auto-restart
while true; do
    echo "Starting application..."
    python3 main.py
    echo "Application crashed or stopped. Restarting in 5 seconds..."
    sleep 5
done
