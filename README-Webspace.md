# 📞 Telefonbuch-App - Webspace Installation

Eine moderne Next.js-Anwendung zur Anzeige von CardDAV-Kontakten aus Nextcloud.

## 🚀 Installation auf Webspace

### 1. Voraussetzungen
- **Node.js 18+** muss auf dem Webspace installiert sein
- **CardDAV-Server** (z.B. Nextcloud) mit Zugriffsdaten
- **PM2** für Process Management (empfohlen für Webspaces)

### 2. Dateien hochladen
1. Alle Dateien aus der ZIP auf den Webspace hochladen
2. Im Terminal/SSH zum Projektordner navigieren

### 3. Abhängigkeiten installieren
```bash
npm install
```

### 4. PM2 installieren (falls nicht vorhanden)
```bash
npm install -g pm2
```

### 5. Umgebungsvariablen konfigurieren
Erstelle eine `.env.local` Datei mit folgenden Inhalten:

```env
CARDDAV_URL=https://deine-nextcloud.de
ADDRESSBOOK_URL=https://deine-nextcloud.de/remote.php/dav/addressbooks/users/BENUTZERNAME/
CARDDAV_USERNAME=dein-benutzername
CARDDAV_PASSWORD=dein-passwort
```

**Wichtig:** Ersetze die Werte mit deinen eigenen CardDAV-Zugangsdaten!

### 6. Produktionsbuild erstellen
```bash
npm run build
```

### 7. Anwendung starten

**Mit PM2 (empfohlen für Webspaces):**
```bash
pm2 start npm --name "telefonbuch" -- start
```

**Alternativ mit npm:**
```bash
npm start
```

### PM2 Management-Befehle
```bash
pm2 status                    # Status aller Apps anzeigen
pm2 restart telefonbuch       # App neustarten
pm2 stop telefonbuch          # App stoppen
pm2 logs telefonbuch          # Live-Logs anzeigen
pm2 save && pm2 startup       # Autostart nach Server-Neustart einrichten
```

Die App läuft dann dauerhaft auf Port 3000.

## 📋 Features
- **3.000+ Kontakte** werden geladen
- **Responsive Design** für Desktop und Mobile
- **Suchfunktion** durch alle Kontakte
- **Filterung** nach Adressbüchern
- **Klickbare Telefonnummern** und E-Mails
- **Fax-Nummern** mit eigenem Icon (📠)
- **Öffentlich zugänglich** - keine Anmeldung erforderlich

## 🔧 Angepasst für
- **Edeka Adressbuch** (2.958 Kontakte)
- **Vertreter** (236 Kontakte)  
- **Handwerker** (10 Kontakte)

## 📱 Unterstützte Daten
- Name und Organisation
- Telefonnummern (inkl. Fax mit speziellem Icon)
- E-Mail-Adressen
- Adressen
- Websites
- Geburtstage
- Notizen

## 🔒 Sicherheit
- Umgebungsvariablen für Zugangsdaten
- Keine Anmeldung erforderlich
- Direkte CardDAV-Verbindung

## 📞 Support
Bei Problemen prüfe:
1. Sind die Umgebungsvariablen korrekt gesetzt?
2. Ist die CardDAV-URL erreichbar?
3. Stimmen Benutzername und Passwort?
4. Läuft PM2 korrekt? (`pm2 status`)

Entwickelt mit ❤️ und Next.js 15.3.2 