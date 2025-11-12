import ApiService from './ApiService';
import { XMetrics, XMetricsPayload } from '@/@types/analytics';

export const apiGetXMetrics = (data: XMetricsPayload) => {
  return ApiService.fetchDataWithAxios<XMetrics>({
    url: `/api:pEDfedqJ/twitter/user/analytics`,
    method: 'post',
    data,
  });
};
