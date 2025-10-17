'use client';

import React from 'react';
import { Mail, Phone, Linkedin, MapPin, Briefcase } from 'lucide-react';
import type { PDLPersonProfile } from '@/lib/peopledatalab/types';
import { sanitizeLinkedInUrl } from '@/lib/utils/call-prep-data';

interface PersonContactModuleProps {
  person: PDLPersonProfile;
}

export function PersonContactModule({ person }: PersonContactModuleProps) {
  return (
    <div className="relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all">
      <div className="flex flex-col gap-4">
        {/* Header with name and title */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {person.full_name || `${person.first_name} ${person.last_name}`}
          </h3>
          {person.job_title && (
            <div className="flex items-center gap-2 mt-2">
              <Briefcase className="h-4 w-4 text-[#C33527]" />
              <p className="text-sm font-medium text-gray-700">{person.job_title}</p>
            </div>
          )}
          {person.job_company_name && (
            <p className="text-sm text-gray-600 mt-1">at {person.job_company_name}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          {person.emails && person.emails.length > 0 && (
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-[#C33527] mt-0.5 flex-shrink-0" />
              <div className="flex flex-col gap-1">
                {person.emails.slice(0, 2).map((email, idx) => (
                  <a
                    key={idx}
                    href={`mailto:${email.address}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {email.address}
                  </a>
                ))}
              </div>
            </div>
          )}

          {person.mobile_phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-[#C33527] flex-shrink-0" />
              <a
                href={`tel:${person.mobile_phone}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {person.mobile_phone}
              </a>
            </div>
          )}

          {person.location_name && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[#C33527] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{person.location_name}</p>
            </div>
          )}

          {(() => {
            const sanitizedLinkedInUrl = sanitizeLinkedInUrl(person.linkedin_url);
            return (
              sanitizedLinkedInUrl && (
                <div className="flex items-center gap-3">
                  <Linkedin className="h-4 w-4 text-[#C33527] flex-shrink-0" />
                  <a
                    href={sanitizedLinkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View LinkedIn Profile
                  </a>
                </div>
              )
            );
          })()}
        </div>
      </div>
    </div>
  );
}
