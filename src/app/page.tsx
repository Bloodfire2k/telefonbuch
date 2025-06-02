'use client';

import { useState, useEffect } from 'react';
import { Search, Phone, Mail, MapPin, Building, User, Filter, Loader2, Globe, Calendar, FileText, Printer } from 'lucide-react';

interface Contact {
  id: string;
  fullName: string;
  organization?: string;
  phone?: string;
  email?: string;
  title?: string;
  note?: string;
  photo?: string;
  website?: string;
  birthday?: string;
  phones?: Array<{ type: string; number: string }>;
  emails?: Array<{ type: string; email: string }>;
  addresses?: Array<{ type: string; address: string }>;
  addressbook: string;
  addressbookDisplayName: string;
}

interface Addressbook {
  name: string;
  displayName: string;
  url: string;
  contacts: Contact[];
}

export default function Home() {
  const [addressbooks, setAddressbooks] = useState<Addressbook[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddressbook, setSelectedAddressbook] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalContacts, setTotalContacts] = useState(0);

  // Funktion zum Bereinigen der Adressbuch-Namen
  const cleanDisplayName = (displayName: string) => {
    // Firmenreferenzen aus dem displayName entfernen
    return displayName.replace(/\s*\([^)]+\)\s*/g, '').trim();
  };

  // Funktion zum Ermitteln des passenden Icons für Telefonnummern
  const getPhoneIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('fax')) {
      return <Printer className="h-3 md:h-3.5 w-3 md:w-3.5 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />;
    }
    return <Phone className="h-3 md:h-3.5 w-3 md:w-3.5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />;
  };

  // Funktion zum Klicken auf Adressbuch-Karten
  const handleAddressbookClick = (addressbookName: string) => {
    setSelectedAddressbook(addressbookName);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchTerm, selectedAddressbook, addressbooks]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/carddav');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAddressbooks(data.addressbooks || []);
      setTotalContacts(data.totalContacts || 0);
      
    } catch (err) {
      console.error('Fehler beim Laden der Kontakte:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const getAddressbookStats = () => {
    // Nur die gewünschten Adressbücher anzeigen
    const relevantAddressbooks = addressbooks.filter(ab => 
      ab.displayName.includes('Edeka') || 
      ab.displayName.includes('Handwerker') || 
      ab.displayName.includes('Vertreter')
    );
    
    return relevantAddressbooks.map(ab => ({
      ...ab,
      contactCount: ab.contacts.length
    }));
  };

  const getFilteredAddressbooks = () => {
    // Nur die gewünschten Adressbücher für den Filter anzeigen
    return addressbooks.filter(ab => 
      ab.displayName.includes('Edeka') || 
      ab.displayName.includes('Handwerker') || 
      ab.displayName.includes('Vertreter')
    );
  };

  const filterContacts = () => {
    let allContacts: Contact[] = [];
    
    // Sammle nur Kontakte aus den gewünschten Adressbüchern
    const relevantAddressbooks = getFilteredAddressbooks();
    relevantAddressbooks.forEach(ab => {
      allContacts.push(...ab.contacts);
    });

    // Filter nach Adressbuch
    if (selectedAddressbook !== 'all') {
      allContacts = allContacts.filter(contact => contact.addressbook === selectedAddressbook);
    }

    // Filter nach Suchbegriff
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      allContacts = allContacts.filter(contact =>
        contact.fullName.toLowerCase().includes(term) ||
        (contact.organization && contact.organization.toLowerCase().includes(term)) ||
        (contact.phone && contact.phone.toLowerCase().includes(term)) ||
        (contact.email && contact.email.toLowerCase().includes(term)) ||
        (contact.note && contact.note.toLowerCase().includes(term))
      );
    }

    setFilteredContacts(allContacts);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Lade Telefonbuch...</h2>
          <p className="text-gray-500 mt-2">Verbinde mit CardDAV-Server</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verbindungsfehler</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadContacts}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Telefonbuch</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                {filteredContacts.length} {selectedAddressbook === 'all' ? 'Kontakte' : `Kontakte im ${cleanDisplayName(addressbooks.find(ab => ab.name === selectedAddressbook)?.displayName || '')} Adressbuch`}
              </p>
            </div>
            <button
              onClick={loadContacts}
              className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm md:text-base self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Aktualisieren</span>
              <span className="sm:hidden">Update</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiken - Responsive Design */}
        <div className="mb-8">
          {/* Desktop Version - Große Karten */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getAddressbookStats().map((ab) => (
              <div 
                key={ab.name} 
                className={`bg-white rounded-lg shadow-sm p-6 border-2 cursor-pointer transition-all duration-200 transform hover:scale-102 ${
                  selectedAddressbook === ab.name 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-transparent hover:border-blue-300 hover:shadow-lg'
                }`}
                onClick={() => handleAddressbookClick(ab.name)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{cleanDisplayName(ab.displayName)}</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{ab.contactCount}</p>
                    <p className="text-sm text-gray-500">Kontakte</p>
                  </div>
                  <div className={`rounded-full p-3 transition-colors ${
                    selectedAddressbook === ab.name ? 'bg-blue-200' : 'bg-blue-100'
                  }`}>
                    <User className={`h-6 w-6 ${
                      selectedAddressbook === ab.name ? 'text-blue-700' : 'text-blue-600'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Version - Kompakte Liste */}
          <div className="md:hidden bg-white rounded-lg shadow-sm p-4 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              Adressbücher
            </h3>
            <div className="space-y-3">
              {getAddressbookStats().map((ab) => (
                <div 
                  key={ab.name} 
                  className={`flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-200 rounded-lg px-3 ${
                    selectedAddressbook === ab.name 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleAddressbookClick(ab.name)}
                >
                  <div className="flex-1">
                    <p className={`font-medium ${
                      selectedAddressbook === ab.name ? 'text-blue-700' : 'text-gray-900'
                    } text-sm`}>{cleanDisplayName(ab.displayName)}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      selectedAddressbook === ab.name 
                        ? 'bg-blue-200 text-blue-800' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ab.contactCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter und Suche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Suchfeld */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder={selectedAddressbook === 'all' ? 'Kontakte durchsuchen...' : `${cleanDisplayName(addressbooks.find(ab => ab.name === selectedAddressbook)?.displayName || '')} durchsuchen...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600 text-base md:text-sm bg-white"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {filteredContacts.length} von {totalContacts} Kontakten angezeigt
          </div>
        </div>

        {/* Kontakte Grid */}
        {filteredContacts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center">
            <User className="h-12 md:h-16 w-12 md:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Kontakte gefunden</h3>
            <p className="text-gray-500 text-sm md:text-base">
              {searchTerm || selectedAddressbook !== 'all' 
                ? 'Versuche andere Suchbegriffe oder Filter'
                : 'Es wurden keine Kontakte geladen'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-2 md:p-3">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 truncate">
                        {contact.fullName}
                      </h3>
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {cleanDisplayName(contact.addressbookDisplayName)}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full p-1.5 ml-2 flex-shrink-0">
                      <User className="h-3 md:h-4 w-3 md:w-4 text-gray-600" />
                    </div>
                  </div>

                  {/* Kontakt-Details */}
                  <div className="space-y-1 md:space-y-1.5">
                    {/* Titel/Organisation Bereich */}
                    {(contact.title || contact.organization) && (
                      <div className="flex items-start text-xs md:text-sm text-gray-600">
                        <Building className="h-3 md:h-3.5 w-3 md:w-3.5 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="truncate leading-none">
                          {/* Bei Vertretern nur die Firma anzeigen, bei anderen title + firma */}
                          {contact.addressbookDisplayName?.includes('Vertreter') 
                            ? contact.organization || contact.title
                            : contact.title && contact.organization 
                              ? `${contact.title} bei ${contact.organization}`
                              : contact.title || contact.organization
                          }
                        </span>
                      </div>
                    )}

                    {/* Telefonnummern Bereich - responsive Abstand zwischen den Nummern */}
                    {((contact.phones && contact.phones.length > 0) || contact.phone) && (
                      <div className="space-y-0.5 md:space-y-1">
                        {/* Mehrere Telefonnummern anzeigen */}
                        {contact.phones && contact.phones.length > 0 ? (
                          contact.phones.map((phoneEntry, index) => (
                            <div key={index} className="flex items-start text-xs md:text-sm text-gray-600">
                              {getPhoneIcon(phoneEntry.type)}
                              <div className="flex-1 truncate min-w-0 leading-tight md:leading-none">
                                <a 
                                  href={`tel:${phoneEntry.number.replace(/\s/g, '')}`}
                                  className="text-blue-600 hover:text-blue-800 break-all font-medium underline decoration-1 underline-offset-2 touch-action-manipulation"
                                  style={{ WebkitTouchCallout: 'default' }}
                                >
                                  {phoneEntry.number}
                                </a>
                                <span className="text-gray-400 ml-1.5 text-xs">({phoneEntry.type})</span>
                              </div>
                            </div>
                          ))
                        ) : contact.phone && (
                          <div className="flex items-start text-xs md:text-sm text-gray-600">
                            <Phone className="h-3 md:h-3.5 w-3 md:w-3.5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                            <a 
                              href={`tel:${contact.phone.replace(/\s/g, '')}`}
                              className="text-blue-600 hover:text-blue-800 truncate break-all font-medium underline decoration-1 underline-offset-2 touch-action-manipulation leading-tight md:leading-none"
                              style={{ WebkitTouchCallout: 'default' }}
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* E-Mails Bereich - responsive Abstand zwischen den E-Mails */}
                    {((contact.emails && contact.emails.length > 0) || contact.email) && (
                      <div className="space-y-0.5 md:space-y-1">
                        {/* Mehrere E-Mails anzeigen */}
                        {contact.emails && contact.emails.length > 0 ? (
                          contact.emails.map((emailEntry, index) => (
                            <div key={index} className="flex items-start text-xs md:text-sm text-gray-600">
                              <Mail className="h-3 md:h-3.5 w-3 md:w-3.5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 truncate min-w-0 leading-tight md:leading-none">
                                <a 
                                  href={`mailto:${emailEntry.email}`}
                                  className="text-blue-600 hover:text-blue-800 break-all font-medium underline decoration-1 underline-offset-2 touch-action-manipulation"
                                  style={{ WebkitTouchCallout: 'default' }}
                                >
                                  {emailEntry.email}
                                </a>
                                <span className="text-gray-400 ml-1.5 text-xs">({emailEntry.type})</span>
                              </div>
                            </div>
                          ))
                        ) : contact.email && (
                          <div className="flex items-start text-xs md:text-sm text-gray-600">
                            <Mail className="h-3 md:h-3.5 w-3 md:w-3.5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                            <a 
                              href={`mailto:${contact.email}`}
                              className="text-blue-600 hover:text-blue-800 truncate break-all font-medium underline decoration-1 underline-offset-2 touch-action-manipulation leading-tight md:leading-none"
                              style={{ WebkitTouchCallout: 'default' }}
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Adressen Bereich */}
                    {contact.addresses && contact.addresses.length > 0 && (
                      <div className="space-y-0.5 md:space-y-1">
                        {contact.addresses.map((addressEntry, index) => (
                          <div key={index} className="flex items-start text-xs md:text-sm text-gray-600">
                            <MapPin className="h-3 md:h-3.5 w-3 md:w-3.5 mr-2 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="break-words min-w-0 leading-tight md:leading-none">
                              <div className="break-words">{addressEntry.address}</div>
                              <span className="text-gray-400 text-xs">({addressEntry.type})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Website */}
                    {contact.website && (
                      <div className="flex items-start text-xs md:text-sm text-gray-600">
                        <Globe className="h-3 md:h-3.5 w-3 md:w-3.5 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                        <a 
                          href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 truncate break-all font-medium underline decoration-1 underline-offset-2 touch-action-manipulation leading-tight md:leading-none"
                          style={{ WebkitTouchCallout: 'default' }}
                        >
                          {contact.website}
                        </a>
                      </div>
                    )}

                    {/* Geburtstag */}
                    {contact.birthday && (
                      <div className="flex items-start text-xs md:text-sm text-gray-600">
                        <Calendar className="h-3 md:h-3.5 w-3 md:w-3.5 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="truncate leading-tight md:leading-none">{contact.birthday}</span>
                      </div>
                    )}

                    {/* Notiz */}
                    {contact.note && (
                      <div className="flex items-start text-xs md:text-sm text-gray-600">
                        <FileText className="h-3 md:h-3.5 w-3 md:w-3.5 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="break-words text-gray-500 italic leading-tight md:leading-none">{contact.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
