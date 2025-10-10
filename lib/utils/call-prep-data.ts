export interface KeyDecisionMaker {
  name: string;
  email?: string;
  title: string;
  linkedin_url?: string;
  kdm_id?: number;
}

export interface EnrichmentData {
  id: number;
  call_prep_response_id: number;
  free_data: {
    regions?: string[];
    education?: Array<{
      school: {
        name: string;
        location?: {
          name: string;
        };
      };
      degrees?: string[];
      start_date?: string;
      end_date?: string;
    }>;
    job_title?: string;
    first_name?: string;
    last_name?: string;
    experience?: Array<{
      title: {
        name: string;
        levels?: string[];
      };
      company: {
        name: string;
        industry?: string;
        location?: {
          name: string;
        };
      };
      start_date?: string | null;
      end_date?: string | null;
      is_primary: boolean;
    }>;
    location_names?: string[];
  };
  payed_data: {
    emails?: string[];
    work_email?: string | null;
    middle_name?: string | null;
    mobile_phone?: string | null;
    phone_numbers?: string[];
    personal_emails?: string[];
    linkedin_username?: string;
  };
}

export interface PeopleDataItem {
  kdm_id: number;
  kdm_name: string;
  kdm_email?: string;
  kdm_linkedin_url?: string;
  x2_data: EnrichmentData[];
}

export interface KeyDecisionMakerWithEnrichment extends KeyDecisionMaker {
  enrichment?: EnrichmentData[];
}

/**
 * Merges key decision makers with their enrichment data
 */
export function mergeKeyDecisionMakersWithEnrichment(
  keyDecisionMakersJson: string,
  peopleDataJson: string
): KeyDecisionMakerWithEnrichment[] {
  // Parse JSON strings
  let keyDecisionMakers: KeyDecisionMaker[] = [];
  let peopleData: PeopleDataItem[] = [];

  try {
    keyDecisionMakers = JSON.parse(keyDecisionMakersJson || '[]');
  } catch (e) {
    console.error('Failed to parse key_decision_makers_contact:', e);
  }

  try {
    peopleData = JSON.parse(peopleDataJson || '[]');
  } catch (e) {
    console.error('Failed to parse people_data:', e);
  }

  // Create a map of people data by matching fields
  const peopleDataMap = new Map<string, { enrichment: EnrichmentData[], kdm_id: number }>();

  peopleData.forEach((person) => {
    // Create multiple keys for matching flexibility
    const keys: string[] = [];

    if (person.kdm_name) {
      keys.push(person.kdm_name.toLowerCase().trim());
    }
    if (person.kdm_email) {
      keys.push(person.kdm_email.toLowerCase().trim());
    }
    if (person.kdm_linkedin_url) {
      // Extract username from LinkedIn URL for matching
      const linkedinMatch = person.kdm_linkedin_url.match(/linkedin\.com\/in\/([^\/]+)/);
      if (linkedinMatch) {
        keys.push(linkedinMatch[1].toLowerCase().trim());
      }
    }

    // Store enrichment data AND kdm_id under all possible keys
    keys.forEach(key => {
      peopleDataMap.set(key, { enrichment: person.x2_data, kdm_id: person.kdm_id });
    });
  });

  // Merge enrichment data into key decision makers
  return keyDecisionMakers.map((kdm) => {
    let enrichmentData: { enrichment: EnrichmentData[], kdm_id: number } | undefined;

    // Try to find enrichment data by name
    if (kdm.name) {
      enrichmentData = peopleDataMap.get(kdm.name.toLowerCase().trim());
    }

    // Try by email if not found
    if (!enrichmentData && kdm.email) {
      enrichmentData = peopleDataMap.get(kdm.email.toLowerCase().trim());
    }

    // Try by LinkedIn username if not found
    if (!enrichmentData && kdm.linkedin_url) {
      const linkedinMatch = kdm.linkedin_url.match(/linkedin\.com\/in\/([^\/]+)/);
      if (linkedinMatch) {
        enrichmentData = peopleDataMap.get(linkedinMatch[1].toLowerCase().trim());
      }
    }

    return {
      ...kdm,
      enrichment: enrichmentData?.enrichment,
      kdm_id: enrichmentData?.kdm_id ?? kdm.kdm_id,
    };
  });
}

/**
 * Format experience for display
 */
export function formatExperience(experience: EnrichmentData['free_data']['experience']): string {
  if (!experience || experience.length === 0) return 'No experience data';

  return experience
    .slice(0, 3) // Show top 3 positions
    .map((exp) => {
      const duration = formatDateRange(exp.start_date, exp.end_date);
      return `${exp.title.name} at ${exp.company.name} (${duration})`;
    })
    .join(' • ');
}

/**
 * Format education for display
 */
export function formatEducation(education: EnrichmentData['free_data']['education']): string {
  if (!education || education.length === 0) return 'No education data';

  return education
    .map((edu) => {
      const degree = edu.degrees?.[0] || 'Degree';
      return `${degree} from ${edu.school.name}`;
    })
    .join(' • ');
}

/**
 * Format date range
 */
function formatDateRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate) return 'Unknown';

  const start = startDate.split('-')[0]; // Get year
  const end = endDate ? endDate.split('-')[0] : 'Present';

  return `${start} - ${end}`;
}
