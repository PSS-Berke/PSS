import type {
  CrmContact,
  CrmCustomer,
  CrmOutreachLog,
  CreateCrmContactRequest,
  CreateCrmCustomerRequest,
  CreateCrmOutreachLogRequest,
  UpdateCrmContactRequest,
  UpdateCrmCustomerRequest,
  UpdateCrmOutreachLogRequest,
} from '@/@types/crm';
import ApiService from './ApiService';

// CRM Contacts API
export const apiGetCrmContacts = (params?: { crm_customer_id?: number; search?: string }) => {
  return ApiService.fetchDataWithAxios<CrmContact[]>({
    url: '/api:6EOeCSr6/crm_contacts',
    method: 'get',
    params,
  });
};

export const apiCreateCrmContact = (data: CreateCrmContactRequest) => {
  return ApiService.fetchDataWithAxios<CrmContact>({
    url: '/api:6EOeCSr6/crm_contacts',
    method: 'post',
    data,
  });
};

export const apiUpdateCrmContact = (id: number, data: UpdateCrmContactRequest) => {
  return ApiService.fetchDataWithAxios<CrmContact>({
    url: `/api:6EOeCSr6/crm_contacts/${id}`,
    method: 'put',
    data,
  });
};

export const apiDeleteCrmContact = (id: number) => {
  return ApiService.fetchDataWithAxios<{}>({
    url: `/api:6EOeCSr6/crm_contacts/${id}`,
    method: 'delete',
  });
};

// CRM Customers API
export const apiGetCrmCustomers = () => {
  return ApiService.fetchDataWithAxios<CrmCustomer[]>({
    url: '/api:6EOeCSr6/crm_customer',
    method: 'get',
  });
};

export const apiCreateCrmCustomer = (data: CreateCrmCustomerRequest) => {
  return ApiService.fetchDataWithAxios<CrmCustomer>({
    url: '/api:6EOeCSr6/crm_customer',
    method: 'post',
    data,
  });
};

export const apiUpdateCrmCustomer = (id: number, data: UpdateCrmCustomerRequest) => {
  return ApiService.fetchDataWithAxios<CrmCustomer>({
    url: `/api:6EOeCSr6/crm_customer/${id}`,
    method: 'put',
    data,
  });
};

export const apiDeleteCrmCustomer = (id: number) => {
  return ApiService.fetchDataWithAxios<{}>({
    url: `/api:6EOeCSr6/crm_customer/${id}`,
    method: 'delete',
  });
};

// CRM Outreach Logs API
export const apiGetCrmOutreachLogs = (params?: { search?: string; crm_customer_id?: number }) => {
  return ApiService.fetchDataWithAxios<CrmOutreachLog[]>({
    url: '/api:6EOeCSr6/crm_outreach_logs',
    method: 'get',
    params,
  });
};

export const apiCreateCrmOutreachLog = (data: CreateCrmOutreachLogRequest) => {
  return ApiService.fetchDataWithAxios<CrmOutreachLog>({
    url: '/api:6EOeCSr6/crm_outreach_logs',
    method: 'post',
    data,
  });
};

export const apiUpdateCrmOutreachLog = (id: number, data: UpdateCrmOutreachLogRequest) => {
  return ApiService.fetchDataWithAxios<CrmOutreachLog>({
    url: `/api:6EOeCSr6/crm_outreach_logs/${id}`,
    method: 'put',
    data,
  });
};

export const apiDeleteCrmOutreachLog = (id: number) => {
  return ApiService.fetchDataWithAxios<{}>({
    url: `/api:6EOeCSr6/crm_outreach_logs/${id}`,
    method: 'delete',
  });
};