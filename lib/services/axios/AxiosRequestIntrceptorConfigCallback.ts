import type { InternalAxiosRequestConfig } from 'axios';

const AxiosRequestIntrceptorConfigCallback = (config: InternalAxiosRequestConfig) => {
  const storage: 'localStorage' | 'sessionStorage' = 'localStorage';
  const TOKEN_NAME_IN_STORAGE_KEY = 'xano_token';
  const REQUEST_HEADER_AUTH_KEY = 'Authorization';
  const TOKEN_TYPE = 'Bearer';
  if (storage === 'localStorage' || storage === 'sessionStorage') {
    let accessToken = '';

    if (storage === 'localStorage') {
      accessToken = localStorage.getItem(TOKEN_NAME_IN_STORAGE_KEY) || '';
    }

    /* if (storage === 'sessionStorage') {
            accessToken = sessionStorage.getItem(TOKEN_NAME_IN_STORAGE_KEY) || ''
        }*/

    if (accessToken) {
      config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${accessToken}`;
    }
  }

  // Dynamically set X-Team-Id header from localStorage
  const teamId = localStorage.getItem('team_id');
  if (teamId) {
    config.headers['X-Team-Id'] = teamId;
  }

  return config;
};

export default AxiosRequestIntrceptorConfigCallback;
