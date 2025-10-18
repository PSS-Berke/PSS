import type { AddContactRequest, CallLog, Contact } from '@/@types/phone';
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
        method: 'put',
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

export const apiStoreCallLog = (data: CallLog) => {
    return ApiService.fetchDataWithAxios<CallLog>({
        url: '/api:mDRLMGRq/call_logs',
        method: 'post',
        data,
    });
};
