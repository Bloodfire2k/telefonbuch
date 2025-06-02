# 🚀 Netlify Deployment - Schritt für Schritt

Da die Netlify CLI aufgrund von Windows-Berechtigungen Probleme macht, hier die **manuelle Deployment-Lösung**:

## ✅ Was ich für Sie vorbereitet habe:

- ✅ **Build erstellt** (`.next` Ordner)
- ✅ **Deployment-ZIP** (`telefonbuch-deployment.zip`)
- ✅ **Netlify-Konfiguration** (`netlify.toml`)
- ✅ **Git-Repository** initialisiert

## 🌐 Option 1: Drag & Drop Deployment (Sofort möglich)

### Schritt 1: Netlify Dashboard
1. Öffnen Sie **https://netlify.com**
2. **Registrieren/Anmelden** (kostenlos)
3. Klicken Sie auf **"Deploy manually"** oder **"Add new site"**

### Schritt 2: Upload
1. **Ziehen Sie den `.next` Ordner** per Drag & Drop in das Netlify-Fenster
   - **ODER** verwenden Sie die ZIP-Datei `telefonbuch-deployment.zip`
2. Netlify erstellt automatisch eine URL wie `https://amazing-name-123456.netlify.app`

### Schritt 3: Umgebungsvariablen setzen
**Wichtig:** Ohne diese funktionieren die Kontakte nicht!

1. Gehen Sie zu **Site Settings → Environment Variables**
2. Fügen Sie hinzu:

```
CARDDAV_URL=https://nextcloud.ecenter-jochum.de
ADDRESSBOOK_URL=https://nextcloud.ecenter-jochum.de/remote.php/dav/addressbooks/users/Kontakte/
CARDDAV_USERNAME=Kontakte
CARDDAV_PASSWORD=contacts@edeka
```

3. **Deploy** nochmal triggern

## 📱 Option 2: GitHub + Automatic Deployments

### Schritt 1: GitHub Repository erstellen
1. Erstellen Sie ein neues Repository auf **github.com**
2. Folgen Sie den GitHub-Anweisungen zum Upload

### Schritt 2: Mit Netlify verknüpfen
1. **Netlify Dashboard** → "New site from Git"
2. **GitHub Repository** auswählen
3. Build-Einstellungen:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** `18.x`

### Schritt 3: Umgebungsvariablen setzen
(Gleich wie oben)

## 🎯 Nach dem Deployment

**Ihre App ist dann verfügbar unter:**
- 🌍 **Öffentliche URL** (z.B. `https://telefonbuch-app-123.netlify.app`)
- 📱 **3.217 Kontakte** von Nextcloud
- 🔍 **Suchfunktion** funktioniert
- 📞 **Klickbare Telefonnummern**
- 📧 **Klickbare E-Mails**

## 🔧 Troubleshooting

### Problem: "App lädt, aber keine Kontakte"
**Lösung:** Umgebungsvariablen im Netlify Dashboard prüfen

### Problem: "Build fehlgeschlagen"
**Lösung:** Node.js Version auf 18.x setzen

### Problem: "404 Error"
**Lösung:** Publish directory auf `.next` setzen

## 💰 Kosten
- **Netlify Free Tier:** 100% kostenlos für diese App
- **Bandwidth:** ~100MB/Monat
- **Build Minutes:** ~3 Minuten pro Deployment

## 📞 Nächste Schritte

1. **Jetzt sofort:** Drag & Drop Deployment testen
2. **Später:** GitHub-Integration für automatische Updates
3. **Custom Domain:** Eigene Domain verknüpfen (optional)

**🎉 Ihre Telefonbuch-App wird dann weltweit verfügbar sein!** 