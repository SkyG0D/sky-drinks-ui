import { USER_CREDENTIALS_KEY } from 'src/contexts/hooks/useAuth';

import { api } from './api';

export function tokenExpirationInterceptor(): void {
  api.interceptors.response.use(
    (response) => response,
    async (error: any) => {
      const tokenExpired = error?.response?.data?.expired || false;
      const status = error?.response?.data?.status || 0;

      if (tokenExpired && status === 401 && error.config) {
        localStorage.removeItem(USER_CREDENTIALS_KEY);
        sessionStorage.removeItem(USER_CREDENTIALS_KEY);

        // eslint-disable-next-line no-param-reassign
        error.config.headers.Authorization = undefined;
        api.defaults.headers.common.Authorization = '';

        throw new Error('Por favor, faça login novamente!');
      } else {
        throw error;
      }
    }
  );
}
