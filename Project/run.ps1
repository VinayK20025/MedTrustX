# ============================================================
# MedTrustX DHOS - Single Command Launch Script
# Usage: .\run.ps1
# ============================================================

$env:PATH = "C:\Program Files\Docker\Docker\resources\bin;$env:PATH"
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "  __  __          _ _____              _ __  __" -ForegroundColor Cyan
Write-Host " |  \/  |___  __| |_   _| _ _  _ ___| |\ \/ /" -ForegroundColor Cyan
Write-Host " | |\/| / -_)/ _' | | || '_| || (_-<  _>  < " -ForegroundColor Cyan
Write-Host " |_|  |_\___|\__,_| |_||_|  \_,_/__/\__/_/\_\" -ForegroundColor Cyan
Write-Host "  Digital Hospital Operating System v1.0" -ForegroundColor DarkCyan
Write-Host ""

# ── Step 1: Preflight Checks ──────────────────────────────────
Write-Host "[1/5] Running preflight checks..." -ForegroundColor Yellow

$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker is not running! Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "      Docker is running." -ForegroundColor Green

$composeFile = Join-Path $PSScriptRoot "docker-compose.yml"
if (-not (Test-Path $composeFile)) {
    Write-Host "[ERROR] docker-compose.yml not found in $PSScriptRoot" -ForegroundColor Red
    exit 1
}
Write-Host "      docker-compose.yml found." -ForegroundColor Green

# ── Step 2: Cleanup any previous run ─────────────────────────
Write-Host ""
Write-Host "[2/5] Cleaning up previous containers..." -ForegroundColor Yellow
docker compose down --remove-orphans 2>&1 | Out-Null
Write-Host "      Done." -ForegroundColor Green

# ── Step 3: Build all images ──────────────────────────────────
Write-Host ""
Write-Host "[3/5] Building all service images (this may take a few minutes)..." -ForegroundColor Yellow
docker compose build --parallel
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker build failed. Check errors above." -ForegroundColor Red
    exit 1
}
Write-Host "      All images built successfully." -ForegroundColor Green

# ── Step 4: Start infrastructure layer ───────────────────────
Write-Host ""
Write-Host "[4/5] Starting services..." -ForegroundColor Yellow

# Tier 1: Data + Security Layer
Write-Host "      [Tier 1] Starting data & security layer..." -ForegroundColor DarkYellow
docker compose up -d `
    pg-clinical pg-operational pg-iam pg-analytics pg-telemed `
    redis redpanda vault opa kong step-ca minio

Write-Host "      Waiting for core databases to be healthy..."
$timeout = 90
$elapsed = 0
while ($elapsed -lt $timeout) {
    $healthy = docker compose ps --format json 2>/dev/null | 
        ConvertFrom-Json -ErrorAction SilentlyContinue | 
        Where-Object { $_.Service -in @("pg-clinical","pg-iam","redis","opa") }
    
    $allHealthy = $healthy | Where-Object { $_.Health -eq "healthy" }
    if ($allHealthy.Count -ge 4) { break }
    
    Start-Sleep -Seconds 5
    $elapsed += 5
    Write-Host "      ... ($elapsed s) waiting for databases..." -ForegroundColor DarkGray
}

# Tier 2: Identity Layer
Write-Host "      [Tier 2] Starting identity layer (Keycloak)..." -ForegroundColor DarkYellow
docker compose up -d keycloak redpanda-console

# Wait for Keycloak
Write-Host "      Waiting for Keycloak to be ready (up to 90s)..."
$elapsed = 0
while ($elapsed -lt 90) {
    $kc = docker inspect --format="{{.State.Health.Status}}" medtrust-keycloak 2>&1
    if ($kc -eq "healthy") { Write-Host "      Keycloak is healthy!" -ForegroundColor Green; break }
    Start-Sleep -Seconds 5; $elapsed += 5
    Write-Host "      ... ($elapsed s) Keycloak starting..." -ForegroundColor DarkGray
}

# Tier 3: Application Services
Write-Host "      [Tier 3] Starting all application services..." -ForegroundColor DarkYellow
docker compose up -d `
    iam-service zta-service gateway-service `
    patient-service clinical-service diagnostics-service pharmacy-service `
    nursing-service medical-records-service `
    appointment-service billing-service order-service `
    audit-service compliance-service

# Tier 4: Frontend
Write-Host "      [Tier 4] Starting frontend..." -ForegroundColor DarkYellow
docker compose up -d frontend

# ── Step 5: Health Report ─────────────────────────────────────
Write-Host ""
Write-Host "[5/5] Waiting for application to be fully ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   MedTrustX DHOS - Service Status" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
docker compose ps --format "table {{.Name}}\t{{.Status}}" | Select-String "medtrust"

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   MedTrustX DHOS is RUNNING!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "   FRONTEND  ->  http://localhost:3000" -ForegroundColor White
Write-Host "   API GATEWAY   ->  http://localhost:8000" -ForegroundColor White
Write-Host "   KEYCLOAK  ->  http://localhost:8080" -ForegroundColor White
Write-Host "   OPA ADMIN ->  http://localhost:8181" -ForegroundColor White
Write-Host "   MINIO     ->  http://localhost:9001" -ForegroundColor White
Write-Host ""
Write-Host "   Admin login: admin / keycloak_admin_2026" -ForegroundColor DarkYellow
Write-Host ""
Write-Host "   To stop: docker compose down" -ForegroundColor DarkGray
Write-Host ""

# Auto-open browser
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
