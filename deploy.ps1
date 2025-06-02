# 🚀 Netlify Deployment Script für Telefonbuch-App
# Führen Sie dieses Script mit: .\deploy.ps1

Write-Host "🚀 Netlify Deployment für Telefonbuch-App startet..." -ForegroundColor Green

# 1. Build erstellen
Write-Host "📦 Erstelle Produktions-Build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build erfolgreich!" -ForegroundColor Green

# 2. Netlify CLI über npx verwenden
Write-Host "🌐 Starte Netlify Deployment..." -ForegroundColor Yellow

# Option 1: Manuelle Anmeldung erforderlich
Write-Host "📋 Führen Sie diese Befehle manuell aus:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Anmeldung bei Netlify:" -ForegroundColor White
Write-Host "   npx netlify-cli login" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Site initialisieren:" -ForegroundColor White  
Write-Host "   npx netlify-cli init" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deployment:" -ForegroundColor White
Write-Host "   npx netlify-cli deploy --prod --dir=.next" -ForegroundColor Gray
Write-Host ""

# Build-Informationen anzeigen
Write-Host "📊 Build-Informationen:" -ForegroundColor Yellow
Write-Host "- Build-Ordner: .next" -ForegroundColor Gray
Write-Host "- Größe des Builds:" -ForegroundColor Gray
$buildSize = (Get-ChildItem -Path ".next" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  ${buildSize:N2} MB" -ForegroundColor Gray

Write-Host ""
Write-Host "🔧 Alternative: Manuelles Deployment" -ForegroundColor Cyan
Write-Host "1. Gehen Sie zu https://netlify.com" -ForegroundColor Gray
Write-Host "2. Ziehen Sie den .next Ordner per Drag & Drop" -ForegroundColor Gray
Write-Host "3. Setzen Sie die Umgebungsvariablen im Dashboard" -ForegroundColor Gray

Write-Host ""
Write-Host "🌍 Nach dem Deployment verfügbar:" -ForegroundColor Green
Write-Host "- 3.217 Kontakte live" -ForegroundColor Gray
Write-Host "- Responsive Design" -ForegroundColor Gray  
Write-Host "- Suchfunktion" -ForegroundColor Gray
Write-Host "- Öffentlich zugänglich" -ForegroundColor Gray

Write-Host ""
Write-Host "✨ Deployment-Script beendet!" -ForegroundColor Green 