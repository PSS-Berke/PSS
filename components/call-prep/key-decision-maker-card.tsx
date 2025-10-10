import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Mail, Linkedin, MapPin } from 'lucide-react';
import type { KeyDecisionMakerWithEnrichment } from '@/lib/utils/call-prep-data';

interface KeyDecisionMakerCardProps {
  decisionMaker: KeyDecisionMakerWithEnrichment;
}

export function KeyDecisionMakerCard({ decisionMaker }: KeyDecisionMakerCardProps) {
  const hasEnrichment = decisionMaker.enrichment && decisionMaker.enrichment.length > 0;
  const enrichmentData = hasEnrichment && decisionMaker.enrichment ? decisionMaker.enrichment[0] : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {decisionMaker.name}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{decisionMaker.title}</p>
          </div>
          {hasEnrichment && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Enriched
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-3">
          {decisionMaker.email && (
            <a
              href={`mailto:${decisionMaker.email}`}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Mail className="h-4 w-4" />
              {decisionMaker.email}
            </a>
          )}
          {decisionMaker.linkedin_url && (
            <a
              href={decisionMaker.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn Profile
            </a>
          )}
        </div>
      </CardHeader>

      {hasEnrichment && enrichmentData && (
        <CardContent className="pt-4 space-y-4">
          {/* Location */}
          {enrichmentData.free_data.location_names && enrichmentData.free_data.location_names.length > 0 && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Location</p>
                <p className="text-sm text-gray-900">{enrichmentData.free_data.location_names[0]}</p>
              </div>
            </div>
          )}

          {/* Current Role */}
          {enrichmentData.free_data.job_title && (
            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Current Role</p>
                <p className="text-sm text-gray-900">{enrichmentData.free_data.job_title}</p>
                {enrichmentData.free_data.experience?.[0]?.company && (
                  <p className="text-xs text-gray-600">
                    at {enrichmentData.free_data.experience[0].company.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Experience Summary */}
          {enrichmentData.free_data.experience && enrichmentData.free_data.experience.length > 0 && (
            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Experience</p>
                <div className="space-y-2">
                  {enrichmentData.free_data.experience.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium text-gray-900">{exp.title.name}</p>
                      <p className="text-gray-700">{exp.company.name}</p>
                      <p className="text-xs text-gray-500">
                        {exp.start_date?.split('-')[0] || '?'} - {exp.end_date ? exp.end_date.split('-')[0] : 'Present'}
                        {exp.company.location?.name && ` • ${exp.company.location.name}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          {enrichmentData.free_data.education && enrichmentData.free_data.education.length > 0 && (
            <div className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Education</p>
                <div className="space-y-1">
                  {enrichmentData.free_data.education.map((edu, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium text-gray-900">
                        {edu.degrees?.[0] || 'Degree'} - {edu.school.name}
                      </p>
                      {edu.school.location && (
                        <p className="text-xs text-gray-500">{edu.school.location.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contact Info (from paid data) */}
          {enrichmentData.payed_data && (enrichmentData.payed_data.work_email || enrichmentData.payed_data.mobile_phone) && (
            <div className="border-t pt-3 mt-3">
              {enrichmentData.payed_data.work_email && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Work Email:</span> {enrichmentData.payed_data.work_email}
                </p>
              )}
              {enrichmentData.payed_data.mobile_phone && (
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">Mobile:</span> {enrichmentData.payed_data.mobile_phone}
                </p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
