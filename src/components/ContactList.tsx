import { Contact } from '@/lib/carddav';
import { useState } from 'react';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ContactListProps {
  contacts: Contact[];
  onContactSelect: (contact: Contact) => void;
}

export function ContactList({ contacts, onContactSelect }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.organization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Suchleiste */}
      <div className="sticky top-0 bg-white p-4 shadow z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Kontakte durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Kontaktliste */}
      <div className="flex-1 overflow-auto">
        <ul className="divide-y divide-gray-200">
          {filteredContacts.map((contact) => (
            <li
              key={contact.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              onClick={() => onContactSelect(contact)}
            >
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="min-w-0 flex-1 flex items-center">
                  <div className="flex-shrink-0">
                    {contact.photo ? (
                      <Image
                        className="h-12 w-12 rounded-full object-cover"
                        src={contact.photo}
                        alt={contact.fullName}
                        width={48}
                        height={48}
                      />
                    ) : (
                      <UserCircleIcon
                        className="h-12 w-12 text-gray-400"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 px-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.fullName}
                      </p>
                      {contact.organization && (
                        <p className="text-sm text-gray-500 truncate">
                          {contact.organization}
                        </p>
                      )}
                      {contact.email && (
                        <p className="text-sm text-gray-500 truncate">
                          {contact.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {filteredContacts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Keine Kontakte gefunden' : 'Keine Kontakte vorhanden'}
          </div>
        )}
      </div>
    </div>
  );
} 