import ApiService from './ApiService';
import { GoogleAnalyticsDisconnectRequest } from '@/@types/analytics';

export const apiDisconnectGoogleAnalytics = (data: GoogleAnalyticsDisconnectRequest) => {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: '/api:_dzvItLQ/google/delete_integration',
    method: 'post',
    data,
  });
};
