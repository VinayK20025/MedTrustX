#!/bin/bash

echo "Starting all clinical services..."
docker-compose -f docker-compose.clinical.yml up -d
echo "Services are up."
