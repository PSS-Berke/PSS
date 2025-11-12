
export type GoogleAnalyticsDisconnectRequest = {
    company_id: number;
}

export type GoogleAnalyticsExchangeTokenRequest = {
    code: string;
    state: string;
}

export type PublicMetrics = {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
    like_count: number;
    media_count: number;
}
export type XTweetPublicMetrics = {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    bookmark_count: number;
    impression_count: number;
}

export type XTweet = {
    id: string;
    text: string;
    created_at: string;
    edit_history_tweet_ids: string[];
    public_metrics: XTweetPublicMetrics;
}

export type XTweetsResponse = XTweet[];
export type XMetrics = {
    public_metrics: PublicMetrics;
    id: number;
    username: string;
    name: string;
}

export type XMetricsPayload = {
    company_id: number;
}