<#
.SYNOPSIS
    MedTrustX Device Trust Agent — Windows Service Installer

.DESCRIPTION
    Installs medtrustx-agent.exe as a Windows service running under the
    LocalSystem account. Supports install, uninstall, start, stop, and
    status sub-commands.

    Prerequisites:
      - Run as Administrator
      - medtrustx-agent.exe must be in the same directory as this script
        OR $env:AGENT_EXE_PATH must point to the executable
      - .NET Framework 4.5+ (pre-installed on Windows 8.1+)

    Usage:
      .\install.ps1 install    — install and start the service
      .\install.ps1 uninstall  — stop and remove the service
      .\install.ps1 start      — start a previously installed service
      .\install.ps1 stop       — stop the running service
      .\install.ps1 status     — print current service status
      .\install.ps1 restart    — stop then start the service

    Environment variables:
      AGENT_EXE_PATH     — full path to medtrustx-agent.exe
                           (default: <script dir>\medtrustx-agent.exe)
      AGENT_INSTALL_DIR  — installation directory
                           (default: C:\Program Files\MedTrustX\Agent)
      AGENT_CONFIG_DIR   — config directory
                           (default: C:\ProgramData\MedTrustX\Agent)
      AGENT_LOG_DIR      — log directory
                           (default: C:\ProgramData\MedTrustX\Agent\logs)
      AGENT_ENV_FILE     — path to .env config file (optional)
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0, Mandatory = $true)]
    [ValidateSet("install", "uninstall", "start", "stop", "status", "restart")]
    [string]$Command
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Configuration ─────────────────────────────────────────────────────────────

$ServiceName    = "medtrustx-agent"
$DisplayName    = "MedTrustX Device Trust Agent"
$Description    = "Zero Trust endpoint attestation for MedTrustX DHOS."
$ScriptDir      = Split-Path -Parent $MyInvocation.MyCommand.Path

$InstallDir     = if ($env:AGENT_INSTALL_DIR) { $env:AGENT_INSTALL_DIR } else { "C:\Program Files\MedTrustX\Agent" }
$ConfigDir      = if ($env:AGENT_CONFIG_DIR)  { $env:AGENT_CONFIG_DIR  } else { "C:\ProgramData\MedTrustX\Agent" }
$LogDir         = if ($env:AGENT_LOG_DIR)     { $env:AGENT_LOG_DIR     } else { "$ConfigDir\logs" }

$SourceExe      = if ($env:AGENT_EXE_PATH) {
                      $env:AGENT_EXE_PATH
                  } else {
                      Join-Path $ScriptDir "medtrustx-agent.exe"
                  }
$InstalledExe   = Join-Path $InstallDir "medtrustx-agent.exe"
$EnvFileSrc     = if ($env:AGENT_ENV_FILE) { $env:AGENT_ENV_FILE } else { Join-Path $ScriptDir "agent.env" }
$EnvFileDst     = Join-Path $ConfigDir "agent.env"

# ── Helpers ───────────────────────────────────────────────────────────────────

function Write-Step([string]$msg) {
    Write-Host "`n[MedTrustX Install] $msg" -ForegroundColor Cyan
}

function Write-OK([string]$msg) {
    Write-Host "[OK] $msg" -ForegroundColor Green
}

function Write-Warn([string]$msg) {
    Write-Host "[WARN] $msg" -ForegroundColor Yellow
}

function Require-Admin {
    $id = [Security.Principal.WindowsIdentity]::GetCurrent()
    $p  = New-Object Security.Principal.WindowsPrincipal($id)
    if (-not $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "This script must be run as Administrator."
    }
}

function Get-ServiceStatus {
    try {
        $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
        return $svc
    } catch {
        return $null
    }
}

# ── ACL helper: grant LocalSystem RX on install dir, modify on config dir ─────

function Set-AgentPermissions {
    param([string]$Path, [string]$Rights)
    try {
        $acl = Get-Acl $Path
        $sid = New-Object System.Security.Principal.SecurityIdentifier("S-1-5-18") # LocalSystem
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $sid, $Rights, "ContainerInherit,ObjectInherit", "None", "Allow"
        )
        $acl.SetAccessRule($rule)
        Set-Acl -Path $Path -AclObject $acl
    } catch {
        Write-Warn "Could not set ACL on ${Path}: $_"
    }
}

# ── Install ───────────────────────────────────────────────────────────────────

function Install-Agent {
    Require-Admin

    Write-Step "Checking prerequisites"

    if (-not (Test-Path $SourceExe)) {
        throw "Executable not found: $SourceExe`nSet `$env:AGENT_EXE_PATH or copy medtrustx-agent.exe next to this script."
    }
    Write-OK "Executable found: $SourceExe"

    $existingSvc = Get-ServiceStatus
    if ($existingSvc) {
        Write-Warn "Service already exists (status: $($existingSvc.Status)) — uninstalling first"
        Uninstall-Agent
    }

    # Create directories
    Write-Step "Creating installation directories"
    foreach ($dir in @($InstallDir, $ConfigDir, $LogDir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-OK "Directory: $dir"
    }

    # Copy binary
    Write-Step "Installing executable"
    Copy-Item -Force $SourceExe $InstalledExe
    Write-OK "Copied to: $InstalledExe"

    # Copy config file if present
    if (Test-Path $EnvFileSrc) {
        Copy-Item -Force $EnvFileSrc $EnvFileDst
        Write-OK "Config: $EnvFileDst"
    } else {
        Write-Warn "No agent.env file found at $EnvFileSrc — agent will use defaults or environment variables"
    }

    # Set permissions
    Set-AgentPermissions -Path $InstallDir  -Rights "ReadAndExecute"
    Set-AgentPermissions -Path $ConfigDir   -Rights "Modify"
    Set-AgentPermissions -Path $LogDir      -Rights "Modify"

    # Build service command line
    # The exe must be invoked with the "run" subcommand
    $SvcBinPath = "`"$InstalledExe`" run"

    # Add env file path via MEDTRUSTX_ENV_FILE env var via registry
    Write-Step "Registering Windows service"
    New-Service `
        -Name        $ServiceName `
        -DisplayName $DisplayName `
        -Description $Description `
        -BinaryPathName $SvcBinPath `
        -StartupType Automatic `
        | Out-Null
    Write-OK "Service registered: $ServiceName"

    # Write environment variables to service registry key
    $SvcRegPath = "HKLM:\SYSTEM\CurrentControlSet\Services\$ServiceName"
    $envVars = @(
        "MEDTRUSTX_ENV_FILE=$EnvFileDst",
        "AGENT_LOG_FILE_PATH=$LogDir\agent.log"
    )
    Set-ItemProperty -Path $SvcRegPath -Name "Environment" -Value $envVars
    Write-OK "Service environment configured"

    # Set recovery options: restart on failure with 60s delay
    sc.exe failure $ServiceName reset= 86400 actions= restart/60000/restart/60000/restart/60000 | Out-Null
    Write-OK "Failure recovery: restart after 60s (3 attempts)"

    # Start the service
    Write-Step "Starting service"
    Start-Service -Name $ServiceName
    $svc = Get-Service -Name $ServiceName
    Write-OK "Service status: $($svc.Status)"

    Write-Host ""
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-OK "Installation complete!"
    Write-Host "  Service : $ServiceName"
    Write-Host "  Binary  : $InstalledExe"
    Write-Host "  Config  : $EnvFileDst"
    Write-Host "  Logs    : $LogDir"
    Write-Host ""
    Write-Host "  To check status: .\install.ps1 status"
    Write-Host "  To view logs   : Get-Content '$LogDir\agent.log' -Wait -Tail 50"
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
}

# ── Uninstall ─────────────────────────────────────────────────────────────────

function Uninstall-Agent {
    Require-Admin

    $svc = Get-ServiceStatus
    if ($svc) {
        if ($svc.Status -ne "Stopped") {
            Write-Step "Stopping service"
            Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
            Write-OK "Service stopped"
        }
        Write-Step "Removing service"
        sc.exe delete $ServiceName | Out-Null
        Write-OK "Service removed"
    } else {
        Write-Warn "Service not found: $ServiceName"
    }

    # Remove binary from install dir (leave config and logs for audit trail)
    if (Test-Path $InstalledExe) {
        Remove-Item -Force $InstalledExe
        Write-OK "Removed: $InstalledExe"
    }

    Write-OK "Uninstall complete. Config and logs preserved in $ConfigDir"
}

# ── Start / Stop / Restart ────────────────────────────────────────────────────

function Start-Agent {
    $svc = Get-ServiceStatus
    if (-not $svc) { throw "Service not installed. Run: .\install.ps1 install" }
    if ($svc.Status -eq "Running") {
        Write-Warn "Service already running"
        return
    }
    Start-Service -Name $ServiceName
    Write-OK "Service started: $((Get-Service -Name $ServiceName).Status)"
}

function Stop-Agent {
    $svc = Get-ServiceStatus
    if (-not $svc) { throw "Service not installed." }
    if ($svc.Status -eq "Stopped") {
        Write-Warn "Service already stopped"
        return
    }
    Stop-Service -Name $ServiceName -Force
    Write-OK "Service stopped: $((Get-Service -Name $ServiceName).Status)"
}

function Status-Agent {
    $svc = Get-ServiceStatus
    if (-not $svc) {
        Write-Host "Service '$ServiceName' is NOT installed." -ForegroundColor Yellow
        return
    }
    Write-Host "Service     : $($svc.Name)"
    Write-Host "Display Name: $($svc.DisplayName)"
    Write-Host "Status      : $($svc.Status)"
    Write-Host "StartType   : $($svc.StartType)"
    Write-Host "Install Dir : $InstallDir"
    Write-Host "Config Dir  : $ConfigDir"
    Write-Host "Log Dir     : $LogDir"
    if (Test-Path $InstalledExe) {
        $ver = (Get-Item $InstalledExe).VersionInfo.ProductVersion
        Write-Host "Binary      : $InstalledExe (v$ver)"
    }
}

# ── Dispatch ──────────────────────────────────────────────────────────────────

try {
    switch ($Command) {
        "install"   { Install-Agent   }
        "uninstall" { Uninstall-Agent }
        "start"     { Start-Agent     }
        "stop"      { Stop-Agent      }
        "restart"   { Stop-Agent; Start-Agent }
        "status"    { Status-Agent    }
    }
} catch {
    Write-Host "[ERROR] $_" -ForegroundColor Red
    exit 1
}
