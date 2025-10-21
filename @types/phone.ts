export type AddContactRequest = {
    name: string;
    phone_number: string;
    email: string;
    company: string;
    is_favorite: boolean;
}


export type Contact = {
    id: number
    created_at: string
    name: string
    company: string
    phone_number: string
    email: string
    is_favorite: boolean
}

export type CallLog = {
    id: number
    created_at: string
    phone_number: string
    contact_name: string
    direction: 'inbound' | 'outbound'
    status: 'completed' | 'failed' | 'busy' | 'no-answer' | 'missed' | 'rejected'
    duration: number
    user_id: number
    contact_id: number
}

export type Recording = {
    account_sid: string
    api_version: string
    call_sid: string
    channels: number
    conference_sid: string | null
    date_created: string
    date_updated: string
    duration: number
    encryption_details: string | null
    error_code: number | null
    media_url: string
    price: number
    price_unit: string
    sid: string
    source: string
    start_time: string
    status: string
    subresource_uris: {
        add_on_results: string
        transcriptions: string
        uri: string
    }
}


export type RecordingsResponse = {
    recordings: Recording[]
    end: number
    next_page_uri: string | null
    page: number
    page_size: number
    previous_page_uri: string | null
    start: number
    total: number
    uri: string
}