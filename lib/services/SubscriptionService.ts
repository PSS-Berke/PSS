import ApiService from './ApiService';
import { RequestSubscriptionLinkRequest, RequestSubscriptionLinkResponse } from '@/@types/subscription';

export const apiRequestSubscriptionLink = (data: RequestSubscriptionLinkRequest) => {
  return ApiService.fetchDataWithAxios<RequestSubscriptionLinkResponse>({
    url: '/api:5AsnGrk0/subscription_create',
    method: 'post',
    data,
  });
};

