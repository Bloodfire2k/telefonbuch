import { NextRequest, NextResponse } from 'next/server';
import { Contact } from '@/lib/carddav';

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// Konfiguration aus Umgebungsvariablen - KEINE Fallback-Werte für Sicherheit
const CARDDAV_URL = process.env.CARDDAV_URL;
const ADDRESSBOOK_URL = process.env.ADDRESSBOOK_URL;
const USERNAME = process.env.CARDDAV_USERNAME;
const PASSWORD = process.env.CARDDAV_PASSWORD;

export async function GET() {
  // Debug: Prüfe welche Umgebungsvariablen tatsächlich geladen werden
  console.log('Debug Umgebungsvariablen:');
  console.log('CARDDAV_URL:', process.env.CARDDAV_URL);
  console.log('ADDRESSBOOK_URL:', process.env.ADDRESSBOOK_URL);
  console.log('CARDDAV_USERNAME:', process.env.CARDDAV_USERNAME);
  console.log('CARDDAV_PASSWORD:', process.env.CARDDAV_PASSWORD ? 'GESETZT' : 'NICHT GESETZT');
  
  // Prüfe ob alle notwendigen Umgebungsvariablen gesetzt sind
  if (!CARDDAV_URL || !ADDRESSBOOK_URL || !USERNAME || !PASSWORD) {
    console.error('FEHLER: Nicht alle CardDAV-Umgebungsvariablen sind gesetzt!');
    console.error('Benötigt: CARDDAV_URL, ADDRESSBOOK_URL, CARDDAV_USERNAME, CARDDAV_PASSWORD');
    return NextResponse.json(
      { error: 'Server-Konfiguration unvollständig. Umgebungsvariablen fehlen.' },
      { status: 500 }
    );
  }

  try {
    console.log('API: CardDAV-Anfrage gestartet');
    
    const authString = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    
    // Timeout-Controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      // 1. Adressbücher abrufen
      const addressbooksResponse = await fetch(ADDRESSBOOK_URL, {
        method: 'PROPFIND',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/xml; charset=utf-8',
          'Depth': '1'
        },
        body: `<?xml version="1.0" encoding="utf-8" ?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:carddav">
  <D:prop>
    <D:displayname />
    <D:resourcetype />
    <C:supported-address-data />
  </D:prop>
</D:propfind>`,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!addressbooksResponse.ok) {
        console.error('Fehler beim Abrufen der Adressbücher:', addressbooksResponse.status);
        return NextResponse.json(
          { error: `CardDAV-Fehler: ${addressbooksResponse.status}` },
          { status: addressbooksResponse.status }
        );
      }

      const addressbooksXml = await addressbooksResponse.text();
      console.log('Adressbücher XML erhalten, Länge:', addressbooksXml.length);

      // Parse Adressbücher
      const addressbooks = parseAddressbooksXml(addressbooksXml);
      console.log('Gefundene Adressbücher:', addressbooks.length);

      // 2. Kontakte für jedes Adressbuch abrufen
      const allContacts: Contact[] = [];
      
      for (const addressbook of addressbooks) {
        console.log(`Lade Kontakte für Adressbuch: ${addressbook.displayName}`);
        
        const contactsController = new AbortController();
        const contactsTimeoutId = setTimeout(() => contactsController.abort(), 30000);
        
        try {
          // Zurück zur ursprünglich funktionierenden PROPFIND-Methode für Kontakte
          const contactsResponse = await fetch(addressbook.url, {
            method: 'PROPFIND',
            headers: {
              'Authorization': `Basic ${authString}`,
              'Content-Type': 'application/xml; charset=utf-8',
              'Depth': '1'
            },
            body: `<?xml version="1.0" encoding="utf-8" ?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:carddav">
  <D:prop>
    <D:getetag />
    <C:address-data />
  </D:prop>
</D:propfind>`,
            signal: contactsController.signal
          });

          clearTimeout(contactsTimeoutId);

          if (contactsResponse.ok) {
            const contactsXml = await contactsResponse.text();
            const contacts = parseContactsXml(contactsXml, addressbook.name, addressbook.displayName);
            allContacts.push(...contacts);
            console.log(`${contacts.length} Kontakte aus ${addressbook.displayName} geladen`);
          } else {
            console.error(`Fehler beim Laden der Kontakte für ${addressbook.displayName}:`, contactsResponse.status);
          }
        } catch (error) {
          clearTimeout(contactsTimeoutId);
          console.error(`Timeout/Fehler beim Laden der Kontakte für ${addressbook.displayName}:`, error);
        }
      }

      // Gruppiere Kontakte nach Adressbüchern
      const addressbooksWithContacts = addressbooks.map(ab => ({
        ...ab,
        contacts: allContacts.filter(contact => contact.addressbook === ab.name)
      }));

      console.log('API: Erfolgreich abgeschlossen');
      console.log('Gesamtanzahl Kontakte:', allContacts.length);
      
      return NextResponse.json({
        addressbooks: addressbooksWithContacts,
        totalContacts: allContacts.length
      });

    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('API: Timeout nach 30 Sekunden');
        return NextResponse.json(
          { error: 'Timeout: CardDAV-Server antwortet nicht' },
          { status: 408 }
        );
      }
      throw error;
    }

  } catch (error) {
    console.error('API: Unerwarteter Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler beim Abrufen der CardDAV-Daten' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Prüfe ob alle notwendigen Umgebungsvariablen gesetzt sind
  if (!CARDDAV_URL || !ADDRESSBOOK_URL || !USERNAME || !PASSWORD) {
    console.error('FEHLER: Nicht alle CardDAV-Umgebungsvariablen sind gesetzt!');
    return NextResponse.json(
      { error: 'Server-Konfiguration unvollständig. Umgebungsvariablen fehlen.' },
      { status: 500 }
    );
  }

  try {
    const { method, path, body } = await request.json();
    
    const authString = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    const url = path ? `${ADDRESSBOOK_URL}${path}` : ADDRESSBOOK_URL;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/xml; charset=utf-8',
        'Depth': '1'
      },
      body
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `CardDAV-Fehler: ${response.status}` },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    const contacts = parseContactsXml(responseText);
    
    return NextResponse.json({ contacts });

  } catch (error) {
    console.error('POST API Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}

function parseAddressbooksXml(xml: string) {
  const addressbooks: Array<{url: string, name: string, displayName: string}> = [];
  
  // Einfacher XML-Parser für Adressbücher - ES2017 kompatibel, case-insensitive
  const responseRegex = /<[dD]:response[^>]*>([\s\S]*?)<\/[dD]:response>/g;
  let match;
  
  while ((match = responseRegex.exec(xml)) !== null) {
    const responseContent = match[1];
    
    // URL extrahieren - case-insensitive
    const hrefMatch = responseContent.match(/<[dD]:href[^>]*>(.*?)<\/[dD]:href>/);
    if (!hrefMatch) continue;
    
    const href = decodeURIComponent(hrefMatch[1]);
    
    // Prüfen ob es ein Adressbuch ist - verbesserte Logik, case-insensitive
    const resourceTypeMatch = responseContent.match(/<[dD]:resourcetype[^>]*>([\s\S]*?)<\/[dD]:resourcetype>/);
    if (!resourceTypeMatch) continue;
    
    const resourceType = resourceTypeMatch[1];
    
    // Prüfe auf verschiedene Adressbuch-Indikatoren
    const isAddressbook = resourceType.includes('addressbook') || 
                         resourceType.includes('C:addressbook') ||
                         resourceType.includes('c:addressbook') ||
                         resourceType.includes('card:addressbook') ||
                         resourceType.includes('carddav:addressbook') ||
                         href.includes('/addressbooks/');
    
    if (!isAddressbook) continue;
    
    // DisplayName extrahieren - case-insensitive
    const displayNameMatch = responseContent.match(/<[dD]:displayname[^>]*>(.*?)<\/[dD]:displayname>/);
    let displayName = displayNameMatch ? decodeHtmlEntities(displayNameMatch[1].trim()) : 'Unbekanntes Adressbuch';
    
    // Firmenreferenzen aus dem displayName entfernen
    displayName = displayName.replace(/\s*\([^)]+\)\s*/g, '').trim();
    
    // Name aus URL extrahieren
    const nameMatch = href.match(/\/([^\/]+)\/?$/);
    const name = nameMatch ? nameMatch[1] : href;
    
    // Vollständige URL erstellen
    const fullUrl = href.startsWith('http') ? href : `${process.env.CARDDAV_URL}${href}`;
    
    addressbooks.push({
      url: fullUrl,
      name: name,
      displayName: displayName
    });
  }
  
  return addressbooks;
}

function parseContactsXml(xml: string, addressbookName?: string, addressbookDisplayName?: string): Contact[] {
  const contacts: Contact[] = [];
  
  console.log(`Parsing XML für ${addressbookDisplayName}, XML-Länge: ${xml.length}`);
  
  // Einfacher XML-Parser für Kontakte - ES2017 kompatibel, case-insensitive
  const responseRegex = /<[dD]:response[^>]*>([\s\S]*?)<\/[dD]:response>/g;
  let match;
  let responseCount = 0;
  
  while ((match = responseRegex.exec(xml)) !== null) {
    responseCount++;
    const responseContent = match[1];
    
    // vCard-Daten extrahieren - erweiterte Suche für verschiedene Namespaces
    let addressDataMatch = responseContent.match(/<[cC]:address-data[^>]*>([\s\S]*?)<\/[cC]:address-data>/);
    if (!addressDataMatch) {
      // Versuche andere Namespace-Varianten
      addressDataMatch = responseContent.match(/<card:address-data[^>]*>([\s\S]*?)<\/card:address-data>/);
    }
    if (!addressDataMatch) {
      // Versuche ohne Namespace
      addressDataMatch = responseContent.match(/<address-data[^>]*>([\s\S]*?)<\/address-data>/);
    }
    
    if (!addressDataMatch) {
      console.log(`Response ${responseCount}: Keine address-data gefunden`);
      continue;
    }
    
    const vcard = decodeHtmlEntities(addressDataMatch[1].trim());
    if (!vcard || !vcard.includes('BEGIN:VCARD')) {
      console.log(`Response ${responseCount}: Keine gültige vCard gefunden`);
      continue;
    }
    
    // URL für ID extrahieren - case-insensitive
    const hrefMatch = responseContent.match(/<[dD]:href[^>]*>(.*?)<\/[dD]:href>/);
    const id = hrefMatch ? hrefMatch[1] : `contact-${contacts.length}`;
    
    const contact = parseVCard(vcard, id, addressbookName, addressbookDisplayName);
    if (contact) {
      contacts.push(contact);
      console.log(`Kontakt geparst: ${contact.fullName}`);
    } else {
      console.log(`Response ${responseCount}: vCard konnte nicht geparst werden`);
    }
  }
  
  console.log(`Insgesamt ${responseCount} Responses gefunden, ${contacts.length} Kontakte geparst`);
  return contacts;
}

function parseVCard(vcard: string, id: string, addressbookName?: string, addressbookDisplayName?: string): Contact | null {
  try {
    const lines = vcard.split(/\r?\n/).filter(line => line.trim());
    
    let fullName = '';
    let email = '';
    let phone = '';
    let organization = '';
    let title = '';
    let note = '';
    let photo = '';
    let website = '';
    let birthday = '';
    
    const phones: Array<{ type: string; number: string }> = [];
    const emails: Array<{ type: string; email: string }> = [];
    const addresses: Array<{ type: string; address: string }> = [];
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const beforeColon = line.substring(0, colonIndex);
      const afterColon = line.substring(colonIndex + 1);
      
      // Property und Parameter trennen
      const [property, ...paramParts] = beforeColon.split(';');
      const params = paramParts.join(';');
      
      switch (property.toUpperCase()) {
        case 'FN':
          fullName = decodeHtmlEntities(afterColon);
          break;
          
        case 'EMAIL':
          const emailValue = decodeHtmlEntities(afterColon);
          if (emailValue) {
            const emailType = extractTypeFromParams(params) || 'Unbekannt';
            emails.push({ type: emailType, email: emailValue });
            if (!email) email = emailValue; // Erste E-Mail als Haupt-E-Mail
          }
          break;
          
        case 'TEL':
          const phoneValue = decodeHtmlEntities(afterColon);
          if (phoneValue) {
            const phoneType = extractPhoneTypeFromParams(params) || 'Unbekannt';
            phones.push({ type: phoneType, number: phoneValue });
            if (!phone) phone = phoneValue; // Erste Telefonnummer als Haupt-Telefon
          }
          break;
          
        case 'ORG':
          organization = decodeHtmlEntities(afterColon);
          break;
          
        case 'TITLE':
          title = decodeHtmlEntities(afterColon);
          break;
          
        case 'NOTE':
          note = decodeHtmlEntities(afterColon);
          break;
          
        case 'PHOTO':
          photo = afterColon;
          break;
          
        case 'N':
          // Strukturierter Name als Fallback wenn FN fehlt
          if (!fullName) {
            const nameParts = afterColon.split(';').map(part => decodeHtmlEntities(part)).filter(part => part);
            fullName = nameParts.join(' ').trim();
          }
          break;
          
        case 'ADR':
          const addressValue = afterColon.split(';').filter(part => part).join(', ');
          if (addressValue) {
            const addressType = extractTypeFromParams(params) || 'Unbekannt';
            addresses.push({ type: addressType, address: decodeHtmlEntities(addressValue) });
          }
          break;
          
        case 'URL':
          if (!website) {
            website = decodeHtmlEntities(afterColon);
          }
          break;
          
        case 'BDAY':
          birthday = decodeHtmlEntities(afterColon);
          break;
      }
    }
    
    // Nur Kontakte mit Namen zurückgeben
    if (!fullName) return null;
    
    // "(Andreas Jochum)" aus dem addressbookDisplayName entfernen
    const cleanedAddressbookDisplayName = addressbookDisplayName ? 
      addressbookDisplayName.replace(/\s*\([^)]+\)\s*/g, '').trim() : '';

    return {
      id,
      fullName,
      email: email || '',
      phone: phone || '',
      organization: organization || '',
      title: title || '',
      note: note || undefined,
      photo: photo || undefined,
      vcard,
      addressbook: addressbookName || '',
      addressbookDisplayName: cleanedAddressbookDisplayName,
      phones: phones.length > 0 ? phones : undefined,
      emails: emails.length > 0 ? emails : undefined,
      addresses: addresses.length > 0 ? addresses : undefined,
      website: website || undefined,
      birthday: birthday || undefined
    };
    
  } catch (error) {
    console.error('Fehler beim Parsen der vCard:', error);
    return null;
  }
}

function extractTypeFromParams(params: string): string {
  if (!params) return 'Unbekannt';
  
  const typeMatch = params.match(/TYPE=([^;,]+)/i);
  if (typeMatch) {
    return typeMatch[1].charAt(0).toUpperCase() + typeMatch[1].slice(1).toLowerCase();
  }
  
  // Fallback: Direkte Typ-Erkennung
  const lowerParams = params.toLowerCase();
  if (lowerParams.includes('work')) return 'Geschäftlich';
  if (lowerParams.includes('home')) return 'Privat';
  if (lowerParams.includes('internet')) return 'Internet';
  
  return 'Unbekannt';
}

function extractPhoneTypeFromParams(params: string): string {
  if (!params) return 'Unbekannt';
  
  const lowerParams = params.toLowerCase();
  
  // Spezifische Telefon-Typen
  if (lowerParams.includes('cell') || lowerParams.includes('mobile')) return 'Handy';
  if (lowerParams.includes('fax')) return 'Fax';
  if (lowerParams.includes('work')) return 'Geschäftlich';
  if (lowerParams.includes('home')) return 'Privat';
  if (lowerParams.includes('voice')) return 'Festnetz';
  
  // TYPE-Parameter extrahieren
  const typeMatch = params.match(/TYPE=([^;,]+)/i);
  if (typeMatch) {
    const type = typeMatch[1].toLowerCase();
    if (type.includes('cell') || type.includes('mobile')) return 'Handy';
    if (type.includes('fax')) return 'Fax';
    if (type.includes('work')) return 'Geschäftlich';
    if (type.includes('home')) return 'Privat';
    if (type.includes('voice')) return 'Festnetz';
    
    return typeMatch[1].charAt(0).toUpperCase() + typeMatch[1].slice(1).toLowerCase();
  }
  
  return 'Telefon';
}

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/&#13;/g, '\n')
    .replace(/&#10;/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
} 