export type RequestSubscriptionLinkRequest = {
    price_id: string;
    company_id: number;
    plan: 'pro' | 'max' | 'enterprise' | 'agency';
};

export type RequestSubscriptionLinkResponse = {
    id: string;
    object: string;
    adaptive_pricing: {
        enabled: boolean;
    };
    after_expiration: null;
    allow_promotion_codes: null;
    amount_subtotal: number;
    url: string;
}