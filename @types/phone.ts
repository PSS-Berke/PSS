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
