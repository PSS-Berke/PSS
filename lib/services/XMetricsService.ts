import ApiService from './ApiService';
import { XMetrics, XMetricsPayload, XTweetsResponse } from '@/@types/analytics';

export const apiGetXMetrics = (data: XMetricsPayload) => {
  return ApiService.fetchDataWithAxios<XMetrics>({
    url: `/api:pEDfedqJ/twitter/user/analytics`,
    method: 'post',
    data,
  });
};

export const apiGetXTweetsMetrics = (data: XMetricsPayload) => {
  return ApiService.fetchDataWithAxios<XTweetsResponse>({
    url: `/api:pEDfedqJ/twitter/user/engagement_analytics`,
    method: 'post',
    data,
  });
};
