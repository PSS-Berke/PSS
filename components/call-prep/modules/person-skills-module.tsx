'use client';

import React from 'react';
import { Award, GraduationCap, Target } from 'lucide-react';
import type { PDLPersonProfile } from '@/lib/peopledatalab/types';

interface PersonSkillsModuleProps {
  person: PDLPersonProfile;
}

export function PersonSkillsModule({ person }: PersonSkillsModuleProps) {
  const skills = person.skills || [];
  const interests = person.interests || [];
  const education = person.education || [];

  return (
    <div className="relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <Award className="h-5 w-5 text-[#C33527]" />
          <h3 className="text-lg font-semibold text-gray-800">Skills & Education</h3>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-[#C33527]" />
              <h4 className="text-sm font-semibold text-gray-700">Top Skills</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 8).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-[#C33527]" />
              <h4 className="text-sm font-semibold text-gray-700">Education</h4>
            </div>
            <div className="space-y-2">
              {education.slice(0, 2).map((edu, idx) => (
                <div key={idx} className="text-sm">
                  <p className="font-medium text-gray-800">{edu.school?.name}</p>
                  {edu.degrees && edu.degrees.length > 0 && (
                    <p className="text-xs text-gray-600">
                      {edu.degrees.join(', ')}
                      {edu.majors && edu.majors.length > 0 && ` in ${edu.majors.join(', ')}`}
                    </p>
                  )}
                  {(edu.start_date || edu.end_date) && (
                    <p className="text-xs text-gray-500">
                      {edu.start_date} - {edu.end_date || 'Present'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {interests.slice(0, 6).map((interest, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#C33527]/10 text-[#C33527] text-xs rounded-full"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {skills.length === 0 && education.length === 0 && interests.length === 0 && (
          <p className="text-sm text-gray-500 italic">No skills or education data available</p>
        )}
      </div>
    </div>
  );
}
