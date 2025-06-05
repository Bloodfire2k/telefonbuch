# Telefonbuch App

Eine Next.js-basierte Telefonbuch-Anwendung, die Kontakte über CardDAV synchronisiert.

## Umgebungsvariablen

Die folgenden Umgebungsvariablen müssen konfiguriert werden:

```env
CARDDAV_URL=https://ihre-nextcloud-url
ADDRESSBOOK_URL=https://ihre-nextcloud-url/remote.php/dav/addressbooks/users/ihr-username/
CARDDAV_USERNAME=ihr-username
CARDDAV_PASSWORD=ihr-passwort
```

## Installation

### Lokale Entwicklung

1. Repository klonen
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. `.env.local` Datei erstellen und Umgebungsvariablen konfigurieren
4. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

### Deployment mit Coolify

1. Verbinden Sie Ihr GitHub-Repository mit Coolify
2. Konfigurieren Sie die erforderlichen Umgebungsvariablen in Coolify
3. Deployment starten

## Features

- Anzeige aller Kontakte aus dem CardDAV-Adressbuch
- Suche nach Kontakten
- Responsive Design
- Direkte Anruf- und E-Mail-Links 