# MedTrustX - Stop All Services
Write-Host "`n>>> Stopping all MedTrust services..." -ForegroundColor Yellow
$env:PATH = "C:\Program Files\Docker\Docker\resources\bin;$env:PATH"
docker compose down
Write-Host "[OK] All services stopped." -ForegroundColor Green
