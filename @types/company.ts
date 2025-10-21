export type CompanyRedacted = {
    company_id: number;
    company_name: string;
    phone_number: string;
    enable_voice_mail: boolean;
    block_incoming_calls: boolean;
    record_all_calls: boolean;
}

export type ChangeCompanyPhonePayload = {
    company_id: number;
    phone_number: string;
    enable_voice_mail: boolean;
    block_incoming_calls: boolean;
    record_all_calls: boolean;
}