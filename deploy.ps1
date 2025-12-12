# One-click deployment script
Write-Host "Starting deployment..."
docker-compose up -d --build
if ($?) {
    Write-Host "Deployment completed. Services are running."
    Write-Host "Web: http://localhost:3000"
    Write-Host "Admin: http://localhost:8080"
} else {
    Write-Host "Deployment failed."
}
