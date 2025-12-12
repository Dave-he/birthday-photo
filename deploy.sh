#!/bin/bash
echo "Starting deployment..."
docker-compose up -d --build
if [ $? -eq 0 ]; then
    echo "Deployment completed. Services are running."
    echo "Web: http://localhost:3000"
    echo "Admin: http://localhost:8080"
else
    echo "Deployment failed."
fi
