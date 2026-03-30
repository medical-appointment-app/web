import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the session token from localStorage to every request.
// The token is stored under 'sessionToken' after login via the external gateway.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sessionToken');
  if (token) {
    config.headers['X-Session-Token'] = token;
  }
  return config;
});

// Surface backend error messages instead of generic Axios errors.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message: string =
      error.response?.data?.message ?? error.message ?? 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);

export default client;
