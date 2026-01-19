const TOKEN_KEY = 'lsapp_token';
const USER_KEY = 'lsapp_user';
const ADMIN_TOKEN_KEY = 'admin_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);
export const getAnyAuthToken = () => getStoredAdminToken() || getStoredToken();
export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
