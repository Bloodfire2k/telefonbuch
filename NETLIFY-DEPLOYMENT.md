# 🚀 Telefonbuch-App auf Netlify deployen

## Schritt 1: Netlify-Account vorbereiten

1. **Netlify-Account erstellen** (falls noch nicht vorhanden): https://netlify.com
2. **GitHub Repository** erstellen und Code hochladen

## Schritt 2: Projekt auf Netlify deployen

### Option A: Über Netlify Dashboard
1. In Netlify einloggen
2. "New site from Git" klicken
3. GitHub Repository auswählen
4. Build-Einstellungen:
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
   - **Node version:** `18.x`

### Option B: Über Netlify CLI (empfohlen)

```bash
# Netlify CLI installieren
npm install -g netlify-cli

# Anmelden bei Netlify
netlify login

# Projekt initialisieren
netlify init

# Build und Deploy
netlify build
netlify deploy --prod
```

## Schritt 3: Umgebungsvariablen konfigurieren

**Wichtig:** Gehen Sie ins Netlify Dashboard → Site Settings → Environment Variables

Fügen Sie folgende Variablen hinzu:

```
CARDDAV_URL=https://nextcloud.ecenter-jochum.de
ADDRESSBOOK_URL=https://nextcloud.ecenter-jochum.de/remote.php/dav/addressbooks/users/Kontakte/
CARDDAV_USERNAME=Kontakte
CARDDAV_PASSWORD=contacts@edeka
```

## Schritt 4: Deployment testen

Nach dem Deployment:
1. **Site URL** öffnen (z.B. `https://amazing-name-123456.netlify.app`)
2. **Kontakte laden** testen
3. **Suchfunktion** prüfen
4. **Responsive Design** auf Mobile testen

## Features nach Deployment

✅ **3.200+ Kontakte** von Nextcloud CardDAV  
✅ **Responsive Design** für alle Geräte  
✅ **Suchfunktion** durch alle Kontakte  
✅ **Filterung** nach Adressbüchern  
✅ **Klickbare Telefonnummern & E-Mails**  
✅ **Serverless API** für CardDAV-Verbindung  
✅ **Öffentlich zugänglich** - keine Anmeldung nötig  

## Automatische Updates

Jeder Git-Push löst automatisch ein neues Deployment aus!

## Troubleshooting

### Problem: API-Funktionen funktionieren nicht
**Lösung:** Umgebungsvariablen im Netlify Dashboard prüfen

### Problem: Build schlägt fehl
**Lösung:** Node.js Version auf 18.x setzen

### Problem: Kontakte laden nicht
**Lösung:** 
1. CardDAV-URLs in Umgebungsvariablen prüfen
2. Netlify Functions Logs überprüfen

## Kosten

- **Netlify Free Tier:** Ausreichend für diese App
- **Build Minutes:** ~2-3 Minuten pro Deployment
- **Bandwidth:** Ca. 100MB pro Monat für normale Nutzung

**Die App ist jetzt live und weltweit verfügbar! 🌍** 