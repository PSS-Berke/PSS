import ApiService from './ApiService';
import { ChangeCompanyPhonePayload, CompanyRedacted } from '@/@types/company';

export const apiChangeCompanyPhoneNumber = (data: ChangeCompanyPhonePayload) => {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: '/api:ZKUwjF5k/phone_settings',
    method: 'post',
    data,
  });
};

export const apiGetCompanyDetails = () => {
  return ApiService.fetchDataWithAxios<CompanyRedacted[]>({
    url: '/api:ZKUwjF5k/company_details',
    method: 'get',
  });
};
