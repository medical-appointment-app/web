import axios, { AxiosError } from 'axios';

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

// User-facing fallbacks for common HTTP status codes. Backend-supplied
// messages are preferred for 4xx responses (they usually contain actionable
// validation details), but 5xx responses always use the friendly copy to
// avoid leaking stack traces or internal errors to end users.
const statusMessages: Record<number, string> = {
  400: 'The request was invalid. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again to continue.',
  403: "You don't have permission to perform this action.",
  404: "We couldn't find what you were looking for.",
  408: 'The request took too long. Please try again.',
  409: 'This action conflicts with the current state. Please refresh and try again.',
  410: 'This resource is no longer available.',
  422: "Some of the information you entered isn't valid. Please review and try again.",
  429: "You're making requests too quickly. Please wait a moment and try again.",
  500: "We can't reach the servers right now. Please try again in a moment.",
  501: 'This feature is not supported yet.',
  502: 'The server is temporarily unavailable. Please try again shortly.',
  503: 'The service is currently unavailable. Please try again soon.',
  504: 'The server took too long to respond. Please try again.',
};

const networkMessage =
  "We can't reach the servers. Please check your internet connection and try again.";
const timeoutMessage = 'The request timed out. Please try again.';
const genericServerMessage = 'Something went wrong on our end. Please try again shortly.';
const genericClientMessage = 'An unexpected error occurred. Please try again.';

const resolveErrorMessage = (error: AxiosError<{ message?: string }>): string => {
  if (error.code === 'ECONNABORTED') {
    return timeoutMessage;
  }

  const response = error.response;
  if (!response) {
    return networkMessage;
  }

  const status = response.status;
  const backendMessage = response.data?.message;

  if (status >= 500) {
    return statusMessages[status] ?? genericServerMessage;
  }

  if (status >= 400) {
    return backendMessage ?? statusMessages[status] ?? genericClientMessage;
  }

  return backendMessage ?? error.message ?? genericClientMessage;
};

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    return Promise.reject(new Error(resolveErrorMessage(error)));
  },
);

export default client;
