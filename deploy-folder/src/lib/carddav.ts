export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  title: string;
  note?: string;
  photo?: string;
  vcard: string;
  addressbook?: string;
  addressbookDisplayName?: string;
  phones?: Array<{ type: string; number: string }>;
  emails?: Array<{ type: string; email: string }>;
  addresses?: Array<{ type: string; address: string }>;
  website?: string;
  birthday?: string;
}

export interface Addressbook {
  name: string;
  displayName: string;
  url: string;
  contacts: Contact[];
}

export async function fetchContacts(): Promise<{ addressbooks: Addressbook[]; totalContacts: number }> {
  try {
    const response = await fetch('/api/carddav');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fehler beim Abrufen der Kontakte:', error);
    throw error;
  }
}

export class CardDAVService {
  private baseUrl: string;
  private authString: string;

  constructor(url: string, username: string, password: string) {
    console.log('Initialisiere CardDAV-Client mit URL:', url);
    
    this.baseUrl = url;
    this.authString = Buffer.from(`${username}:${password}`).toString('base64');
  }

  async fetchAddressbooks(): Promise<Addressbook[]> {
    console.log('Lade Adressbücher...');
    
    try {
      const response = await fetch('/api/carddav', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Adressbücher erfolgreich geladen:', data.addressbooks?.length || 0);
      
      return data.addressbooks || [];
    } catch (error) {
      console.error('Fehler beim Laden der Adressbücher:', error);
      throw error;
    }
  }

  async fetchContacts(addressbookPath?: string): Promise<Contact[]> {
    console.log('Lade Kontakte...', addressbookPath ? `für ${addressbookPath}` : 'alle');
    
    try {
      const response = await fetch('/api/carddav', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'PROPFIND',
          path: addressbookPath || '',
          body: `<?xml version="1.0" encoding="utf-8" ?>
<D:propfind xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:carddav">
  <D:prop>
    <D:getetag />
    <C:address-data />
  </D:prop>
</D:propfind>`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Kontakte erfolgreich geladen:', data.contacts?.length || 0);
      
      return data.contacts || [];
    } catch (error) {
      console.error('Fehler beim Laden der Kontakte:', error);
      throw error;
    }
  }
} 