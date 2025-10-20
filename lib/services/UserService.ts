import type { AddContactRequest, CallLog, Contact } from '@/@types/phone';
import ApiService from './ApiService';

export const apiRequestPasswordReset = (email: string) => {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: '/api:iChl_6jf/auth/request-password-reset',
    method: 'post',
    data: { email },
  });
};

export const apiResetPassword = (token: string, newPassword: string) => {
  return ApiService.fetchDataWithAxios<{ message: string }>({
    url: '/api:iChl_6jf/auth/reset-password',
    method: 'post',
    data: { token, password: newPassword },
  });
};
