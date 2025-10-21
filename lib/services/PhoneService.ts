import type {
  AddContactRequest,
  CallLog,
  Contact,
  Recording,
  RecordingsResponse,
} from '@/@types/phone';
import ApiService from './ApiService';

export const apiAddContact = (data: AddContactRequest) => {
  return ApiService.fetchDataWithAxios<Contact>({
    url: '/api:GqG2MSGo/contacts',
    method: 'post',
    data,
  });
};

export const apiEditContact = (id: number, data: AddContactRequest) => {
  return ApiService.fetchDataWithAxios<Contact>({
    url: `/api:GqG2MSGo/contacts/${id}`,
    method: 'patch',
    data,
  });
};

export const apiGetContacts = () => {
  return ApiService.fetchDataWithAxios<Contact[]>({
    url: '/api:GqG2MSGo/contacts',
    method: 'get',
  });
};

export const apiGetCallLogs = () => {
  return ApiService.fetchDataWithAxios<CallLog[]>({
    url: '/api:mDRLMGRq/call_logs',
    method: 'get',
  });
};

export const apiGetRecordings = () => {
  return ApiService.fetchDataWithAxios<RecordingsResponse>({
    url: '/api:mDRLMGRq/call_recordings',
    method: 'get',
  });
};

export const apiDeleteContact = (id: number) => {
  return ApiService.fetchDataWithAxios<Contact>({
    url: `/api:GqG2MSGo/contacts/${id}`,
    method: 'delete',
  });
};

export const apiUpdateCallLog = (call_sid: string, disconnected_at: string) => {
  return ApiService.fetchDataWithAxios<Contact>({
    url: `/api:mDRLMGRq/call_logs`,
    method: 'put',
    data: {
      disconnected_at,
      call_sid,
    },
  });
};

export const apiStoreCallLog = (data: CallLog) => {
  return ApiService.fetchDataWithAxios<CallLog>({
    url: '/api:mDRLMGRq/call_logs',
    method: 'post',
    data,
  });
};
