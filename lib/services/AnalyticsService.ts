import ApiService from './ApiService';
import {
  GoogleAnalyticsDisconnectRequest,
  GoogleAnalyticsExchangeTokenRequest,
} from '@/@types/analytics';

export const apiDisconnectGoogleAnalytics = (data: GoogleAnalyticsDisconnectRequest) => {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: '/api:_dzvItLQ/google/delete_integration',
    method: 'post',
    data,
  });
};

export const apiExchangeGoogleAnalyticsToken = (data: GoogleAnalyticsExchangeTokenRequest) => {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: `/api:_dzvItLQ/google/exchange_token?code=${data.code}&state=${data.state}`,
    method: 'get',
  });
};
