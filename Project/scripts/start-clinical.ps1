# MedTrustX - Tier 3: Clinical Environment (~16GB RAM)
# All clinical + operational + integrations

Write-Host "`n>>> Starting MedTrust Clinical (Tier 3 - ~16GB RAM)..." -ForegroundColor Cyan

$env:PATH = "C:\Program Files\Docker\Docker\resources\bin;$env:PATH"

& "$PSScriptRoot\start-dev.ps1"

Write-Host "`nAdding clinical services + integrations..." -ForegroundColor Yellow

docker compose up -d `
  ot-service icu-service blood-bank-service infection-control-service `
  devices-service ai-service analytics-service threat-detection-service `
  er-service bed-management-service hr-service facilities-service `
  inventory-service telemedicine-service notification-service `
  management-service marketing-service legal-service transplant-service `
  hapi-fhir orthanc emqx `
  jitsi-web jitsi-prosody jitsi-jicofo jitsi-jvb coturn `
  postal radicale

Write-Host "`n[OK] Clinical environment started." -ForegroundColor Green
