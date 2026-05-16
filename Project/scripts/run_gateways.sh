#!/bin/bash
set -e

echo "Starting Gateway infrastructure..."
docker-compose -f docker-compose.gateway.yml up -d --build

echo "Waiting for services to become healthy..."
sleep 10
docker ps | grep gateway
echo "Gateway infrastructure is running!"
