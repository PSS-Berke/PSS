'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, GraduationCap, Mail, Linkedin, MapPin, Copy, ExternalLink, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { KeyDecisionMakerWithEnrichment } from '@/lib/utils/call-prep-data';
import { sanitizeLinkedInUrl } from '@/lib/utils/call-prep-data';

interface KeyDecisionMakerCardProps {
  decisionMaker: KeyDecisionMakerWithEnrichment;
  onEnrich?: () => void;
  isEnriching?: boolean;
}

export function KeyDecisionMakerCard({ decisionMaker, onEnrich, isEnriching = false }: KeyDecisionMakerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasEnrichment = decisionMaker.enrichment && decisionMaker.enrichment.length > 0;
  const enrichmentData = hasEnrichment && decisionMaker.enrichment ? decisionMaker.enrichment[0] : null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getPrimaryEmail = () => {
    if (enrichmentData?.payed_data?.work_email) return enrichmentData.payed_data.work_email;
    if (decisionMaker.email) return decisionMaker.email;
    return null;
  };

  const getYearsOfExperience = () => {
    if (!enrichmentData?.free_data?.experience || enrichmentData.free_data.experience.length === 0) return null;

    const experiences = enrichmentData.free_data.experience;
    const dates = experiences
      .map(exp => ({
        start: exp.start_date ? parseInt(exp.start_date.split('-')[0]) : null,
        end: exp.end_date ? parseInt(exp.end_date.split('-')[0]) : new Date().getFullYear()
      }))
      .filter(d => d.start !== null);

    if (dates.length === 0) return null;

    const earliestYear = Math.min(...dates.map(d => d.start!));
    const latestYear = Math.max(...dates.map(d => d.end));

    return latestYear - earliestYear;
  };

  const yearsExp = getYearsOfExperience();
  const primaryEmail = getPrimaryEmail();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-gray-200">
      <CardHeader className="pb-3">
        {/* Header with name and status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {decisionMaker.name}
              </h3>
              {hasEnrichment && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1 shrink-0">
                  <Sparkles className="h-3 w-3" />
                  Enriched
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{decisionMaker.title}</p>
            {yearsExp && (
              <p className="text-xs text-gray-500 mt-1">{yearsExp}+ years experience</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {primaryEmail && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => window.location.href = `mailto:${primaryEmail}`}
              >
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(primaryEmail)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </>
          )}
          {(() => {
            const sanitizedLinkedInUrl = sanitizeLinkedInUrl(decisionMaker.linkedin_url);
            return sanitizedLinkedInUrl && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() => window.open(sanitizedLinkedInUrl, '_blank')}
              >
                <Linkedin className="h-3 w-3 mr-1" />
                LinkedIn
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            );
          })()}
          {!hasEnrichment && onEnrich && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-[#C33527] text-[#C33527] hover:bg-[#C33527] hover:text-white"
              onClick={onEnrich}
              disabled={isEnriching}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {isEnriching ? 'Enriching...' : 'Enrich'}
            </Button>
          )}
        </div>
      </CardHeader>

      {hasEnrichment && enrichmentData && (
        <>
          <CardContent className="pt-0 pb-3">
            {/* Expand/Collapse Button */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs text-gray-600"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide Full Profile
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  View Full Profile
                </>
              )}
            </Button>

            {/* Full Profile - Hidden by Default */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t space-y-4">
                {/* Full Experience */}
                {enrichmentData.free_data.experience && enrichmentData.free_data.experience.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Experience</p>
                    <div className="space-y-3">
                      {enrichmentData.free_data.experience.slice(0, 5).map((exp, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="font-medium text-gray-900">{exp.title.name}</p>
                          <p className="text-gray-700 text-xs">{exp.company.name}</p>
                          <p className="text-xs text-gray-500">
                            {exp.start_date?.split('-')[0] || '?'} - {exp.end_date ? exp.end_date.split('-')[0] : 'Present'}
                            {exp.company.location?.name && ` • ${exp.company.location.name}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Education */}
                {enrichmentData.free_data.education && enrichmentData.free_data.education.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Education</p>
                    <div className="space-y-2">
                      {enrichmentData.free_data.education.map((edu, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="font-medium text-gray-900">
                            {edu.degrees?.[0] || 'Degree'}
                          </p>
                          <p className="text-xs text-gray-700">{edu.school.name}</p>
                          {edu.school.location && (
                            <p className="text-xs text-gray-500">{edu.school.location.name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                {enrichmentData.payed_data?.mobile_phone && (
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Contact</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">{enrichmentData.payed_data.mobile_phone}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => copyToClipboard(enrichmentData.payed_data.mobile_phone!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
