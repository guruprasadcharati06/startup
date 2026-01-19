export const TOKEN_KEYS = ['admin_token', 'token', 'lsapp_token'];

export const decodeTokenPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const resolveToken = () => {
  for (const key of TOKEN_KEYS) {
    const stored = localStorage.getItem(key);
    if (stored) {
      return { token: stored, key };
    }
  }
  return { token: null, key: null };
};

export const isTokenValid = (payload) => {
  if (!payload) {
    return false;
  }
  if (!payload.exp) {
    return true;
  }
  const nowSeconds = Date.now() / 1000;
  return payload.exp > nowSeconds;
};
