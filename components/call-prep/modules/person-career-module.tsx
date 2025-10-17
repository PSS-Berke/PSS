'use client';

import React from 'react';
import { Building2, Calendar, MapPin } from 'lucide-react';
import type { PDLPersonProfile } from '@/lib/peopledatalab/types';

interface PersonCareerModuleProps {
  person: PDLPersonProfile;
}

export function PersonCareerModule({ person }: PersonCareerModuleProps) {
  const experiences = person.experience || [];
  const displayExperiences = experiences.slice(0, 4); // Show top 4 experiences

  return (
    <div className="relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <Building2 className="h-5 w-5 text-[#C33527]" />
          <h3 className="text-lg font-semibold text-gray-800">Career History</h3>
        </div>

        <div className="space-y-4">
          {displayExperiences.length > 0 ? (
            displayExperiences.map((exp, idx) => (
              <div key={idx} className="border-l-2 border-[#C33527]/30 pl-4">
                <h4 className="font-semibold text-gray-800 text-sm">
                  {exp.title?.name || 'Position'}
                </h4>
                <p className="text-sm text-gray-700 font-medium mt-1">
                  {exp.company?.name || 'Company'}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-600">
                  {(exp.start_date || exp.end_date) && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {exp.start_date || 'Unknown'} - {exp.end_date || 'Present'}
                      </span>
                    </div>
                  )}

                  {exp.location_names && exp.location_names.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{exp.location_names[0]}</span>
                    </div>
                  )}
                </div>

                {exp.summary && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{exp.summary}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No career history available</p>
          )}
        </div>

        {experiences.length > 4 && (
          <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
            +{experiences.length - 4} more positions
          </p>
        )}
      </div>
    </div>
  );
}
