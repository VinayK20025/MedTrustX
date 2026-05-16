<#
.SYNOPSIS
MedTrustX Unified Backend Orchestrator

.DESCRIPTION
This script is the single entry point to start all integrated backend modules.
It sets up the necessary environment and executes the Python orchestrator to 
run the microservices in parallel, aggregating their logs into this console window.

.EXAMPLE
.\start_all.ps1
Starts the default number of services (up to 10 to prevent system crash).

.\start_all.ps1 -Include "patient,clinical,icu,break-glass"
Starts specifically targeted services.

.\start_all.ps1 -Max 20
Starts up to 20 services.
#>

param (
    [string]$Include = "",
    [string]$Exclude = "",
    [int]$Max = 10,
    [int]$BasePort = 8000
)

$ErrorActionPreference = "Stop"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "     MedTrustX Backend Integration Orchestrator        " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python not found! Please install Python 3.10+ and add it to your PATH." -ForegroundColor Red
    exit 1
}

# 2. Check for orchestrator script
$orchestratorPath = Join-Path $PWD "run_backends.py"
if (-not (Test-Path $orchestratorPath)) {
    Write-Host "Error: run_backends.py not found in the current directory." -ForegroundColor Red
    exit 1
}

# 3. Build arguments
$argsList = @()
if ($Include) { $argsList += "--include"; $argsList += $Include }
if ($Exclude) { $argsList += "--exclude"; $argsList += $Exclude }
if ($Max -gt 0) { $argsList += "--max"; $argsList += $Max.ToString() }
if ($BasePort -gt 0) { $argsList += "--base-port"; $argsList += $BasePort.ToString() }

# 4. Execute orchestrator
Write-Host "Starting integration engine..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C at any time to gracefully shut down all services." -ForegroundColor Yellow
Write-Host ""

try {
    # Using Start-Process with NoNewWindow to keep output in current console 
    # but allowing Python to handle its own Ctrl+C trap
    $process = Start-Process -FilePath "python" -ArgumentList @($orchestratorPath) + $argsList -NoNewWindow -PassThru -Wait
} catch {
    Write-Host "Execution stopped." -ForegroundColor Yellow
}

Write-Host "Orchestrator exited." -ForegroundColor Cyan
